var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var assign = new Command('comment', function(slack, jira, context) {
  var tokenized = /comment\s+([^\s]+)\s+(.+)/.exec(slack.text.trim());
  var issue = tokenized[1];
  var comment = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);

  if (hasIssue) {
    var jiraComment = {
      body: comment
      // // jira's rest api doesn't support this yet
      // author: {
      //   name: slack.user_name
      // }
    };
    jira.issue.addComment({'issueKey':issue, 'comment':jiraComment}, function(err, confirm) {
      if (err) {
        console.log(err);
        var errMessage = new Message('oops. i was unable to add the comment.');
        response.send(slack.response_url, errMessage, context.done);
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
        response.sendFrom(slack.user_id, slack.channel_id, message, context.done);
      }
    });
  } else if (comment) {
    var noMessage = new Message('i need a valid issue to comment on.');
    response.send(slack.response_url, noMessage, context.done);
  } else {
    var badMessage = new Message('you forgot to tell me what your comment is.');
    response.send(slack.response_url, badMessage, context.done);
  }
});

assign.setHelp('comment issueKey _your comments here_', 'comment on an issue');

module.exports = assign;
