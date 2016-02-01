var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/die|leave/, function(slack, jira, context) {
  var message = new Message('that hurts. please be nice.');
  response.send(slack.response_url, message, context.done);
});
