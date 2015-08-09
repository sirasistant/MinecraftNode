var schedule = require('node-schedule');
var cron = require('cron');
var CronJob=cron.CronJob;

new CronJob('0 * * * * *', function() {
   console.log('The answer to life, the universe, and everything!');
}, null, true, 'Europe/Madrid');