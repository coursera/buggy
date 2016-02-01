var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var user = new Command('user', function(slack, jira, context) {
  var tokenized = /(user\s*)?(.+)/.exec(slack.text.trim());
  var user = tokenized[2];
  user = user.replace(/^@/, '');

  var firstResponse = 'ok! i\'m going to bug ' + user + ' for you';

  response.send(slack.response_url, new Message(firstResponse), function() {
    var message = new Message(':ant:', true);
    response.sendTo(user, message, context.done);
  });
});

user.setHelp('@user', 'bug someone');

module.exports = user;
