exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        {
          username: "lknope",
          name: "Leslie Knope",
          password:
            "$2a$12$rnhzZvyK6vUEw9GC7aMLCOdIWWUuCT2IVjB4BZ6U2xzgS.2l0IgQ6"
        },
        {
          username: "aperkins",
          name: "Ann Perkins",
          password:
            "$2a$12$rnhzZvyK6vUEw9GC7aMLCOdIWWUuCT2IVjB4BZ6U2xzgS.2l0IgQ6"
        },
        {
          username: "bwyatt",
          name: "bwyatt",
          password:
            "$2a$12$rnhzZvyK6vUEw9GC7aMLCOdIWWUuCT2IVjB4BZ6U2xzgS.2l0IgQ6"
        }
      ]);
    });
};
