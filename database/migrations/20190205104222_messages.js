exports.up = function(knex, Promise) {
  return knex.schema.createTable("messages", table => {
    table.increments();
    table.string("message_title").notNullable();
    table.string("message_content").notNullable();
    table.integer("user_id").unsigned();
    table
      .foreign("user_id")
      .references("id")
      .on("users");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("messages");
};
