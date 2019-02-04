exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        { username: "lknope", name: "Leslie Knope", password: "pass1" },
        { username: "aperkins", name: "Ann Perkins", password: "pass1" },
        { username: "bwyatt", name: "bwyatt", password: "calzonelover55" }
      ]);
    });
};
