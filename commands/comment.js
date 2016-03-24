var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var comment = new Command('comment', function(slack, jira) {
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

    jira.issue.addComment({'issueKey':issue, 'comment':jiraComment}, function(err, confirm) {
      if (err) {
        var errMessage = new Message('oops. i was unable to add the comment.');
        response.send(slack.response_url, errMessage);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' commented on ' + issue,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' commented on ' + issue,
          color: 'good'
        });
        response.sendFrom(slack.user_id, slack.channel_id, message);
      }
    });
  } else if (comment) {
    return new Message('i need a valid issue to comment on.');
  } else {
    return new Message('you forgot to tell me what your comment is.');
  }
});

comment.setHelp('comment issueKey _your comments here_', 'comment on an issue');

module.exports = comment;
