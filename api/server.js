require("dotenv").config();

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
        console.log(decodedToken);
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
server.get("/messages/:id", (req, res) => {
  const { id } = req.params;
  db("users")
    .leftJoin("messages", "messages.user_id", "users.id")
    .where("user_id", id)
    .select("message_title", "message_content")
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

server.get("/messages", async (req, res) => {
  const messages = await db("messages");
  where({ id: req.params.id }).first();

  res.status(200).json(messages);
});

module.exports = server;
