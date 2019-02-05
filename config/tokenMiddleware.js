require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = {
  generateToken: user => {
    const payload = {
      id: user.id,
      name: user.name,
      username: user.username
    };

    const secret = process.env.JWT_SECRET;
    const options = {
      expiresIn: "1h"
    };
    return jwt.sign(payload, secret, options);
  }
};
