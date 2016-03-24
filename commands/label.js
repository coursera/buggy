var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var label = new Command('label', function(slack, jira, context, config) {
  var tokenized = /label\s+([^\s]+)\s+(.+)/.exec(slack.text.trim());
  var issue = tokenized[1];
  var labels = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);

  if (hasIssue) {
    var options = {
      issueKey: issue,
      issue: {
        fields: {
          'labels': labels.split(' ')
        },
        update: {
          comment: [{
              add: {
                body: slack.user_name + ' added labels:' + labels + ', via /buggy'
              }
          }]
        }
      }
    };

    jira.issue.editIssue(options, function(err, confirm) {
      if (err) {
        console.log(err);
        var errMessage = new Message('oops. i was unable to add any labels.');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' added labels to ' + issue,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' added labels to ' + issue,
          color: 'good'
        });
        response.sendFrom(slack.user_id, slack.channel_id, message, config.slack);
      }
    });
  } else if (labels) {
    var noMessage = new Message('i need a valid issue to label.');
    response.send(slack.response_url, noMessage, context.done);
  } else {
    var badMessage = new Message('you forgot to tell me the labels');
    response.send(slack.response_url, badMessage, context.done);
  }
});

label.setHelp('label issueKey label1 label2 label3', 'add labels to an issue');

module.exports = label;
