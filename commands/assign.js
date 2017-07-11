var Message = require('../slack/message');
var Command = require('../slack/command');

var assign = new Command('assign', (slack, jira, config, command) => {
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

    jira.issue.editIssue(options, (err, confirm) => {
      if (err) {
        var errMessage = 'oops. i was unable to complete the assignment.';
        command.reply(slack.response_url, errMessage, 'in_channel');
      } else {
        var message = new Message(config.slack);
        message.setReplyAll();
        message.setText(slack.command + ' ' + slack.text);
        message.addAttachment({
          title: slack.user_name + ' assigned ' + issue + ' to ' + '@' + user,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' assigned ' + issue + ' to ' + user,
          color: 'good'
        });
        message.setChannel(slack.channel_id);
        message.setUsername(slack.user_name);
        message.post();
      }
    });
  } else if (user) {
    return command.buildResponse('i need a valid issue to assign.');
  } else {
    return command.buildResponse('you forgot to tell me what or who to assign.');
  }
});

assign.setHelp('assign _@user_ issueKey', 'assign an issue to another user');

module.exports = assign;
