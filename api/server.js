require("dotenv").config();

// const twilio = require("twilio");
const express = require("express");
const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/tokenMiddleware");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(morgan("short"));
server.use(cors());
// server.use(twilio);

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

        res.status(200).json({ message: `welcome ${user.username}`, token });
      } else {
        res
          .status(401)
          .json({ message: "login and/or password are incorrect" });
      }
    })
    .catch(err => res.status(500).json(err));
});

//Message endpoints
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

//mentees endpoints
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

module.exports = server;
