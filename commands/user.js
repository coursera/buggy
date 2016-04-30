var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var user = new Command('user', function(slack, jira, config) {
  var tokenized = /(user\s*)?(.+)/.exec(slack.text.trim());
  var user = tokenized[2];
  user = user.replace(/^@/, '');

  var firstResponse = 'ok! i\'m going to bug ' + user + ' for you';

  response.send(slack.response_url, new Message(firstResponse));
  response.sendTo(user, new Message(':ant:  _(' + slack.user_name + ' made me do it)_', true), config);
});

user.setHelp('@user', 'bug someone');

module.exports = user;
