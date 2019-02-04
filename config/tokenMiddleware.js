require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = {
  protected: (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          next(
            res
              .status(401)
              .json({ error: "Incorrect credentials. Please try again." })
          );
        } else {
          req.decodedToken = decodedToken;
          next();
        }
      });
    }
  },

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
