var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/poop|poo/, function(slack, jira) {
  var message = new Message(':poop:');
  message.setResponseType(true);
  return message;
});
