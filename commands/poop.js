var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/poop|poo/, function(slack, jira, context) {
  response.send(slack.response_url, new Message(':poop:'), context.done);
});
