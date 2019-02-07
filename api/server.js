require("dotenv").config();

const express = require("express");
const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/tokenMiddleware");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const client = require("twilio")(process.env.AUTH_SID, process.env.AUTH_TOKEN);
const schedule = require("node-schedule");
const server = express();

server.use(helmet());
server.use(express.json());
server.use(morgan("short"));
server.use(cors());

//middleware

function lock(req, res, next) {
  //auth token is normally sent in the Authorization header.
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "invalid token" });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "no token provided" });
  }
}

function sendMessage(phone_number, message) {
  client.messages.create(
    {
      to: "+1" + phone_number,
      from: process.env.FROM_NUMBER,
      body: message
    },
    (err, message) => {
      if (message) {
        console.log("message sent");
      } else {
        console.log(err);
      }
    }
  );
}

const schedules = {};
const date = new Date("* * * * *");

server.get("/test", function(req, res, next) {
  const text = sendMessage();
  res.status(200).json({ text });
});

server.put("/test", function(req, res) {
  const { phone, message_id, message, date } = req.body;
  const newSchedule = "* * * * *";
  // const date = new Date("* * * * *");
  db("messages")
    .where("id", message_id)
    .update("schedule", newSchedule)
    .then(() => {
      if (schedules[message_id]) {
        schedules[message_id].cancel();
      }
      schedules[message_id] = schedule.scheduleJob("* * * * *", () =>
        sendMessage(phone, "id " + message_id + ": " + message)
      );
      res.json("Schedule Intiated.");
    })
    .catch(err => {
      res.status(500).json({
        message: "Schedule unable to be initiated"
      });
    });
});

server.get("/", (req, res) => {
  res.send("sanity check");
});

server.get("/users", async (req, res) => {
  const users = await db("users").select("id", "username");
  res.status(200).json({ users });
});

//Sign up endpoint

server.post("/signup", (req, res) => {
  const userInfo = req.body;
  const hash = bcrypt.hashSync(userInfo.password, 12);
  userInfo.password = hash;
  if (req.body.username && req.body.password && req.body.name) {
    db("users")
      .insert(userInfo, "id")
      .then(ids => {
        const id = ids[0];
        db("users")
          .where("id", id)
          .then(user => {
            res.status(201).json({ subject: id });
          })
          .catch(err => {
            res.status(500).json({
              message: "The user could not be registered at this time."
            });
          });
      })
      .catch(err => {
        res.status(500).json({
          message: "The user could not be registered at this time. Again"
        });
      });
  } else {
    res.status(400).json({
      message: "Please provide a username, password, and name to register"
    });
  }
});

//login endpoint

server.post("/login", (req, res) => {
  const creds = req.body;

  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        //login is successful, create the token.
        const token = generateToken(user);

        res
          .status(200)
          .json({
            message: `welcome ${user.username} your id is ${user.id}`,
            token
          });
      } else {
        res
          .status(401)
          .json({ message: "login and/or password are incorrect" });
      }
    })
    .catch(err => res.status(500).json(err));
});

//Editing a mentors information
server.put("/users/:id", lock, (req, res) => {
  const { id } = req.params;
  const users = req.body;
  if (users.name || users.password) {
    db("users")
      .where("id", id)
      .update(users)
      .then(row => {
        if (row) {
          res.status(201).json({ message: "Mentor info updated" });
        } else {
          res.status(404).json({ message: "this mentor doesn't exist" });
        }
      })
      .catch(err => {
        res
          .status(404)
          .json({ message: "the mentors info cannot be updated at this time" });
      });
  } else {
    res.status(400).json({ message: "Need to include new name or password" });
  }
});

//Message endpoints

// Get all user messages
server.get("/messages", lock, (req, res) => {
  const { id } = req.decodedToken;
  db("users")
    .leftJoin("messages", "messages.user_id", "users.id")
    .where("user_id", id)
    .select("messages.id", "message_title", "message_content")
    .then(userInfo => {
      res.send(userInfo);
    })
    .catch(err => console.log(err));
});

//Post a new message from user(Mentor)
server.post("/messages", lock, (req, res) => {
  const { message_title, message_content } = req.body;
  const { id } = req.decodedToken;
  db("messages")
    .insert({
      message_title,
      message_content,
      user_id: id
    })
    .where("user_id", id)
    .then(messages => {
      res.json({ message_title, message_content });
    })
    .catch(err => {
      res.status(500).json({ error: "Message could not be created" });
    });
});

//delete a specific message from users account
server.delete("/messages/:id", lock, (req, res) => {
  const { id } = req.params;
  db("messages")
    .where("messages.id", id)
    .del()
    .then(row => {
      if (row) {
        res.json({ message: "Message successfully removed" });
      } else {
        res
          .status(404)
          .json({ message: "Message could not be removed from database" });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: "the message could not be deleted at this time" });
    });
});

//edit a messages title or content on users account.
server.put("/messages/:id", lock, (req, res) => {
  const { id } = req.params;
  const messages = req.body;
  if (messages.message_content || messages.message_title) {
    db("messages")
      .where("id", id)
      .update(messages)
      .then(row => {
        if (row) {
          res.status(201).json({ message: "Message content updated" });
        } else {
          res.status(404).json({ message: "this message doesn't exist" });
        }
      })
      .catch(err => {
        res
          .status(404)
          .json({ message: "the message cannot be updated at this time" });
      });
  } else {
    res
      .status(400)
      .json({ message: "Need to include new message content/title" });
  }
});

//mentees endpoints

//Get list of mentees
server.get("/mentees", lock, (req, res) => {
  const { id } = req.decodedToken;
  db("users")
    .leftJoin("mentees", "mentees.user_id", "users.id")
    .where("user_id", id)
    .select("mentees.id", "mentee_name", "phone_number")
    .then(userInfo => {
      res.send(userInfo);
    })
    .catch(err => console.log(err));
});

// Get single mentee
server.get("/mentees/:id", lock, (req, res) => {
  const { id } = req.params;
  db("mentees")
    .where("id", id)
    .select("mentees.id", "mentee_name", "phone_number")
    .then(rows => {
      if (rows.length > 0) {
        res.json(rows);
      } else {
        res.status(404).json({ message: "This mentee does not exist" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "No mentee information was received" });
    });
});

// create a new mentee
server.post("/mentees", lock, (req, res) => {
  const { mentee_name, phone_number } = req.body;
  const { id } = req.decodedToken;
  db("mentees")
    .insert({
      mentee_name,
      phone_number,
      user_id: id
    })
    .where("user_id", id)
    .then(mentees => {
      res.json({ mentee_name, phone_number });
    })
    .catch(err => {
      res.status(500).json({ error: "mentee could not be created" });
    });
});

//delete a specific mentee
server.delete("/mentees/:id", lock, (req, res) => {
  const { id } = req.params;
  db("mentees")
    .where("mentees.id", id)
    .del()
    .then(row => {
      if (row) {
        res.json({ message: "Mentee successfully removed" });
      } else {
        res
          .status(404)
          .json({ message: "Mentee could not be removed from database" });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: "the mentee could not be deleted at this time" });
    });
});

// edit a mentees data
server.put("/mentees/:id", lock, (req, res) => {
  const { id } = req.params;
  const mentees = req.body;
  if (mentees.mentee_name || mentees.phone_number) {
    db("mentees")
      .where("id", id)
      .update(mentees)
      .then(row => {
        if (row) {
          res.status(201).json({ message: "Mentee info updated" });
        } else {
          res.status(404).json({ message: "this mentee doesn't exist" });
        }
      })
      .catch(err => {
        res
          .status(404)
          .json({ message: "the mentees info cannot be updated at this time" });
      });
  } else {
    res
      .status(400)
      .json({ message: "Need to include new mentee_name or phone_number" });
  }
});
module.exports = server;
