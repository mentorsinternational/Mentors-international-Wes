const db = require("./dbconfig");

module.exports = {
  addUser: async credentials => {
    const Ids = await db("users").insert(credentials);
    return { id: Ids[0] };
  },
  getUser: () => {
    return db("users").select("id", "username", "name");
  },
  login: async credentials => {
    const user = await db("users")
      .where({ username: credentials.username })
      .first();
    return user;
  }
};

module.exports = db;
