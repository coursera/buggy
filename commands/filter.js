var Message = require('../slack/message');
var Command = require('../slack/command');

var filter = new Command('filter', (slack, jira, config) => {
  var tokenized = slack.text.trim().split(' ');
  var command = this;

  if (tokenized.length > 1) {
    tokenized.shift();

    var jql = tokenized.join(' ').replace(/"/g, '\"');

    jira.search.search({'jql':jql}, function(err, results) {
      if (err) {
        var errMessage = ' ... looks like your filtered everything out!';
        command.reply(slack.response_url, errMessage, 'in_channel');
      } else {
        var message = new Message(config.slack);
        message.setText(slack.command + ' ' + slack.text);
        message.setReplyAll();

        for (var i = 0; i < Math.min(results.total, 10); i++) {
          message.attachIssue(results.issues[i], config.jira.host, true);
        } 

        message.postAsWebHook(slack.user_name);
      }
    });
  } else {
    return command.buildResponse('you forgot to tell me what filter you want to use!');
  }
});

filter.setHelp('filter jql', 'filter issuers using jira query language');

module.exports = filter;
