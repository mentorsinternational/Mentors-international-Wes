const express = require("express");
const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { protected, generateToken } = require("../config/tokenMiddleware");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(morgan("short"));
server.use(cors({ credentials: true, origin: "http://localhost:3000 " }));

server.get("/", (req, res) => {
  res.send("sanity check");
});

//Sign up endpoint

server.post("/signup", (req, res) => {
  const userInfo = req.body;
  const hash = bcrypt.hashSync(userInfo.password, 12);
  userInfo.password = hash;
  if (req.body.username && req.body.password && req.body.name) {
    db("users")
      .insert(userInfo)
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
        res
          .status(500)
          .json({ message: "The user could not be registered at this time." });
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

module.exports = server;
