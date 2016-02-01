var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/hi|hola|yo|hello/, function(slack, jira, context) {
  console.log('command hi is running');
  var message = new Message('hi, i\'m buggy, i hope you are having a bug free day!');
  response.send(slack.response_url, message, context.done);
});
