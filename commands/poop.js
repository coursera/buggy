var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/poop|poo/, function(slack, jira, context) {
  var message = new Message(':poop:');
  message.setResponseType(true);
  response.send(slack.response_url, message, context.done);
});
