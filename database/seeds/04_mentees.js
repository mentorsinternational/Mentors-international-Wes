exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("mentees")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("mentees").insert([
        { mentee_name: "mentee1", phone_number: "8019001389", user_id: 1 },
        { mentee_name: "mentee2", phone_number: "8019001389", user_id: 1 },
        { mentee_name: "mentee3", phone_number: "8019001389", user_id: 1 },
        { mentee_name: "mentee4", phone_number: "8019001389", user_id: 2 },
        { mentee_name: "mentee5", phone_number: "8019001389", user_id: 2 },
        { mentee_name: "mentee6", phone_number: "8019001389", user_id: 2 },
        { mentee_name: "mentee7", phone_number: "8019001389", user_id: 3 },
        { mentee_name: "mentee8", phone_number: "8019001389", user_id: 3 },
        { mentee_name: "mentee9", phone_number: "8019001389", user_id: 3 }
      ]);
    });
};
