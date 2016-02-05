var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var component = new Command('component', function(slack, jira, context) {
  var tokenized = /component\s+([^\s]+)\s+(.+)/.exec(slack.text.trim());
  var issue = tokenized[1];
  var components = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);

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
        console.log(err);
        var errMessage = new Message('oops. i was unable to add any components.');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' added components to ' + issue,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' added components to ' + issue,
          color: 'good'
        });
        response.sendFrom(slack.user_id, slack.channel_id, message, context.done);
      }
    });
  } else if (components) {
    var noMessage = new Message('i need a valid issue to add a component.');
    response.send(slack.response_url, noMessage, context.done);
  } else {
    var badMessage = new Message('you forgot to tell me the component');
    response.send(slack.response_url, badMessage, context.done);
  }
});

component.setHelp('component issueKey componentName', 'add component to an issue');

module.exports = component;
