exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("reminders")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("reminders").insert([
        {
          reminder_title: "Testing-name",
          reminder_content: "Leslie",
          user_id: 1
        },
        { reminder_title: "Testing-age", reminder_content: "38", user_id: 1 },
        {
          reminder_title: "Testing-fcolor",
          reminder_content: "blue",
          user_id: 1
        },
        {
          reminder_title: "Testing-name",
          reminder_content: "Anne",
          user_id: 2
        },
        { reminder_title: "Testing-age", reminder_content: "36", user_id: 2 },
        {
          reminder_title: "Testing-fcolor",
          reminder_content: "purple",
          user_id: 2
        },
        { reminder_title: "Testing-name", reminder_content: "Ben", user_id: 3 },
        { reminder_title: "Testing-age", reminder_content: "38", user_id: 3 },
        {
          reminder_title: "Testing-fcolor",
          reminder_content: "orange",
          user_id: 3
        },
        {
          reminder_title: "Testing-fcolor",
          reminder_content: "green",
          user_id: 4
        }
      ]);
    });
};
