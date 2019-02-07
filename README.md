Backend for Mentors International (Lambda project)

1. What and Why
   The purpose of this project is that A mentor/trainer can log in and set up a variety of reminders as to the content of the most recent lesson, goal reminders, and the time and location of the next meeting. Mentors can create a profile, and add messages to their profile, and add a list of clients to a messaging group. Once the messages are complete, you'll submit them to be sent to your list of clients throughout the month. Use Twilio (https://www.twilio.com/) to set up the messaging services necessary for your app to send out the reminders. Reminds should be sent via text or WhatsApp.

   The backend is made up of the following databases and end points:
   Active databases:

   - users
     schema table structure:
     table.increments();
     table.string("username", 225).notNullable().unique();
     table.string("name", 225).notNullable();
     table.string("password", 225).notNullable()

   - messages
     schema table structure:
     table.increments();
     table.string("message_title").notNullable();
     table.string("message_content").notNullable();
     table.string("schedule");
     table.integer("user_id").unsigned();
     table.foreign("user_id").references("id").on("users");
   - mentees
     schema table structure:
     table.increments();
     table.string("mentee_name").notNullable();
     table.string("phone_number", 225).notNullable();
     table.integer("user_id").unsigned();
     table.foreign("user_id").references("id").on("users");

Endpoints (found on server.js)
*post: /signup - New user can go and sign up with a username, name and password.
*post: /login - User can login with username and password. Password is hashed and authentication occurs.
*put /users/:id - a logged in user can update their name or password on this endpoint
*get /messages - a logged in user can get their messages.
*post /messages - a logged in user can post a new message.
*delete /messages/:id -a logged in user can delete specific message
*put /messages/:id - a logged in user can edit the message content or title.
*get /mentees - a logged in user can get a list of mentees
*get /mentees/:id - a logged in user can get a specific mentees name and phone number.
*post /mentees - a logged in user can created a new mentee with their name and phone number, it will assign the mentee to the user that created them.
*delete /mentees/:id - a logged in user can delete a mentee from the system.
*put /mentees/:id - a logged in user can update a mentees name or phone number.

2. How to setup

   1. Fork and clone this repository.
   2. run yarn init to grab all proper package.json dependencies.

3. How to run
   1. run yarn add nodemon --dev
   2. script is yarn server so in terminal run "yarn server"
   3. If running correctly should see "API running on port 4600"
4. How to contribute
