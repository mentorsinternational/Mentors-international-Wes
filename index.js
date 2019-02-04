const server = require("./api/server");

const port = 4600;

server.listen(port, function() {
  console.log(`API running on port ${port}`);
});
