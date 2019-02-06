require("dotenv").config();
// Twilio Credentials
const accountSid = "ACdcf74e60bb28ca5a1d7d2437f87d2aea";
const authToken = process.env.AUTH_TOKEN;

// require the Twilio module and create a REST client
const client = require("twilio")(accountSid, authToken);

client.messages.create(
  {
    to: "+18019001389",
    from: "+12162424468",
    body: "This is the ship that made the Kessel Run in fourteen parsecs?"
  },
  (err, message) => {
    console.log(err);
    console.log(message.sid);
  }
);
