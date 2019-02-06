exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("messages")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("messages").insert([
        {
          message_title: "Knope for president",
          message_content: "I should run in 2020",
          user_id: 1
        },
        {
          message_title: "Buy Wyatt new pants",
          message_content: "love to watch him walk away",
          user_id: 1
        },
        {
          message_title: "Need more binder clips",
          message_content: "30 new project binders in mind",
          user_id: 1
        },
        {
          message_title: "Galentines day",
          message_content: "Get leslie the better present",
          user_id: 2
        },
        {
          message_title: "Nurse schedule",
          message_content: "back to overnights",
          user_id: 2
        },
        {
          message_title: "Ann PERKins",
          message_content: "love the way he says my name",
          user_id: 2
        },
        {
          message_title: "Knope for president",
          message_content: "She should run in 2020",
          user_id: 3
        },
        {
          message_title: "New spreadsheets",
          message_content: "I'm so lucky",
          user_id: 3
        },
        {
          message_title: "Return batman suit?",
          message_content: "Nah... treat-yo-self",
          user_id: 3
        }
      ]);
    });
};
