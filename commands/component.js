var Message = require('../slack/message');
var Command = require('../slack/command');

var component = new Command('component', (slack, jira, config) => {
  var tokenized = /component\s+([^\s]+)\s+(.+)/.exec(slack.text.trim());
  var issue = tokenized[1];
  var components = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);
  var command = this;

  if (hasIssue) {
    var options = {
      issueKey: issue,
      issue: {
        fields: {
          components: [{name: components}]
        },
        update: {
          comment: [{
              add: {
                body: slack.user_name + ' added components:' + components + ', via /buggy'
              }
          }]
        }
      }
    };

    jira.issue.editIssue(options, function(err, confirm) {
      if (err) {
        var errMessage = 'oops. i was unable to add any components.';
        command.reply(slack.response_url, errMessage, 'in_channel');
      } else {
        var text = slack.command + ' ' + slack.text;

        var message = new Message(config.slack);
        message.setText(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' added components to ' + issue,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' added components to ' + issue,
          color: 'good'
        });
        message.setChannel(slack.channel_id);
        message.setUsername(slack.user_id);
        message.post();
      }
    });
  } else if (components) {
    return command.buildResponse('i need a valid issue to add a component.');
  } else {
    return command.buildResponse('you forgot to tell me the component');
  }
});

component.setHelp('component issueKey componentName', 'add component to an issue');

module.exports = component;
