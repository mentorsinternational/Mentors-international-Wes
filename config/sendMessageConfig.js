require("dotenv").config();

// Twilio Credentials
const accountSid = "ACdcf74e60bb28ca5a1d7d2437f87d2aea";
const authToken = process.env.AUTH_TOKEN;
const fromNumber = "12162424468";

// require the Twilio module and create a REST client

module.exports = { accountSid, authToken, fromNumber };
