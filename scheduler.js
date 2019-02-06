var scheduler = require("node-schedule");
var rule = new scheduler.RecurrenceRole();
rule.hour = 7
rule.dayOfWeek = new.schedule.Range(0, 6)
var dailyJob = schedule.scheduleJob(date, function() {
    console.log()
})


module.exports = scheduler;
