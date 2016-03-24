var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var assign = new Command('assign', function(slack, jira) {
  var tokenized = /assign\s+([^\s]+)\s+([^\s]+)/.exec(slack.text.trim());
  var issue = tokenized[2];
  var user = tokenized[1].replace(/^@/, '');
  var hasIssue = /(\w+)-(\d+)/.test(issue);

  if (hasIssue) {
    var options = {
      issueKey: issue,
      issue: {
        fields: {
          'assignee': {name: user},
        },
        update: {
          comment: [{
              add: {
                body: slack.user_name + ' assigned this issue to ' + user + ' via /buggy'
              }
          }]
        }
      }
    };

    jira.issue.editIssue(options, function(err, confirm) {
      if (err) {
        var errMessage = new Message('oops. i was unable to complete the assignment.');
        response.send(slack.response_url, errMessage);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' assigned ' + issue + ' to ' + '@' + user,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' assigned ' + issue + ' to ' + user,
          color: 'good'
        });
        response.sendFrom(slack.user_id, slack.channel_id, message);
      }
    });
  } else if (user) {
    return new Message('i need a valid issue to assign.');
  } else {
    return new Message('you forgot to tell me what or who to assign.');
  }
});

assign.setHelp('assign @user issueKey', 'assign an issue to another user');

module.exports = assign;
