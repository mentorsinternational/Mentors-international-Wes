require("dotenv").config();
const client = require("twilio");
const {
  accountSid,
  authToken,
  fromNumber
} = require("./config/sendMessageConfig");

client.messages.create(
  {
    to: "+18019001389",
    from: fromNumber,
    body: "This is the ship that made the Kessel Run in fourteen parsecs?"
  },
  (err, message) => {
    if (message) {
      console.log(message.sid);
    } else {
      console.log(err);
    }
  }
);

// create a function that takes in a message body and phone number and send message.
//try to create an endpoint with it.
