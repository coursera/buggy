var Message = require('../slack/message');
var Command = require('../slack/command');

var comment = new Command('comment', (slack, jira, config, command) => {
  var tokenized = /comment\s+([^\s]+)\s+(.+)/.exec(slack.text.trim());
  var issue = tokenized[1];
  var comment = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);

  if (hasIssue) {
    var jiraComment = {
      body: comment + '\n\n by ' + slack.user_name + ' via ' + slack.command
      // // jira's rest api doesn't support this yet
      // author: {
      //   name: slack.user_name
      // }
    };

    jira.issue.addComment({'issueKey':issue, 'comment':jiraComment}, (err, confirm) => {
      if (err) {
        var errMessage = 'oops. i was unable to add the comment.';
        command.reply(slack.response_url, errMessage, 'in_channel');
      } else {
        var message = new Message(config.slack);
        message.setText(slack.command + ' ' + slack.text);
        message.setReplyAll();
        message.addAttachment({
          title: slack.user_name + ' commented on ' + issue,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' commented on ' + issue,
          color: 'good'
        });
        message.setChannel(slack.channel_id);
        message.setUsername(slack.user_name);
        message.post();
      }
    });
  } else if (comment) {
    return command.buildResponse('i need a valid issue to comment on.');
  } else {
    return command.buildResponse('you forgot to tell me what your comment is.');
  }
});

comment.setHelp('comment issueKey _your comments here_', 'comment on an issue');

module.exports = comment;
