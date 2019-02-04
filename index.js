require("dotenv").config();
const server = require("./api/server");

const port = process.env.PORT || 4600;

server.listen(port, function() {
  console.log(`API running on port ${port}`);
});
