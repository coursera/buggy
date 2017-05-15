var Message = require('../slack/message');
var Command = require('../slack/command');

var watch = new Command('watch', (slack, jira, config) => {
  var tokenized = /watch\s+([^\s]+)/.exec(slack.text.trim());
  var issue = tokenized[1];
  var hasIssue = /(\w+)-(\d+)/.test(issue);
  var command = this;

  if (hasIssue) {
    jira.issue.addWatcher({'issueKey':issue, 'watcher':slack.user_name}, (err, confirm) => {
      if (err) {
        var errMessage = 'oops. i was unable to add you as a watcher.';
        command.reply(slack.response_url, errMessage);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(config.slack);
        message.setText(text);
        message.setReplyAll();
        message.addAttachment({
          title: slack.user_name + ' is now watching ' + issue,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' is now watching ' + issue,
          color: 'good'
        });
        message.setChannel(slack.channel_id);
        message.setUsername(slack.user_id);
        message.post();
      }
    });
  } else if (user) {
    return command.buildResponse('i need a valid issue to watch.');
  } else {
    return command.buildResponse('you forgot to tell me which issue to watch.');
  }
});

watch.setHelp('watch issueKey', 'adds you as a watcher to a bug');

module.exports = watch;
