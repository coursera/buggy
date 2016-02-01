var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command('kill', function(slack, jira, context) {
  var message = new Message('try as you might, you will never kill all the bugs!');
  response.send(slack.response_url, message, context.done);
});
