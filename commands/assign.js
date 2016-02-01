var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var assign = new Command('assign', function(slack, jira, context) {
  var tokenized = /assign\s+([^\s]+)\s+([^\s]+)/.exec(slack.text.trim());
  var issue = tokenized[2];
  var user = tokenized[1].replace(/^@/, '');
  var hasIssue = /(\w+)-(\d+)/.test(issue);

  if (hasIssue) {
    jira.issue.assignIssue({'issueKey':issue, 'assignee':user}, function(err, confirm) {
      if (err) {
        console.log(err);
        var errMessage = new Message('oops. i was unable to complete the assignment.');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' assigned ' + issue + ' to ' + user,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' assigned ' + issue + ' to ' + user,
          color: 'good'
        });
        response.sendFrom(slack.user_id, slack.channel_id, message, context.done);
      }
    });
  } else if (user) {
    var noMessage = new Message('i need a valid issue to assign.');
    response.send(slack.response_url, noMessage, context.done);
  } else {
    var badMessage = new Message('you forgot to tell me what or who to assign.');
    response.send(slack.response_url, badMessage, context.done);
  }
});

assign.setHelp('assign @user issueKey', 'assign an issue to another user');

module.exports = assign;
