exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", table => {
    table.increments();
    table
      .string("username", 225)
      .notNullable()
      .unique();

    table.string("name", 225).notNullable();
    table.string("password", 225).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("users");
};
