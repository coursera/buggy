var Message = require('../slack/message');
var Command = require('../slack/command');
var SlackUtil = require('../slack/util');

var filter = new Command('filter', (slack, jira, config, command) => {
  var tokenized = slack.text.trim().split(' ');

  if (tokenized.length > 1) {
    tokenized.shift();

    var jql = tokenized.join(' ').replace(/"/g, '\"');

    jira.search.search({'jql':jql}, function(err, results) {
      if (err) {
        var errMessage = ' ... looks like your filtered everything out!';
        command.reply(slack.response_url, errMessage);
      } else {
        var message = new Message(config.slack);
        message.setText(slack.command + ' ' + slack.text);
        message.setReplyAll();

        for (var i = 0; i < Math.min(results.total, 10); i++) {
          message.addAttachment(SlackUtil.jiraIssueToAttachment(results.issues[i], config.jira.host, true));
        } 

        message.setChannel('@' + slack.user_name);
        message.post();
      }
    });
  } else {
    return command.buildResponse('you forgot to tell me what filter you want to use!');
  }
});

filter.setHelp('filter jql', 'filter issuers using jira query language');

module.exports = filter;
