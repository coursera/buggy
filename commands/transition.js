var Message = require('../slack/message');
var Command = require('../slack/command');

// submit for review is 711
// stop progress is 301
var transition = new Command(/resolve|stop|start|close|reopen|review/, (slack, jira, config) => {
  var tokenized = /(resolve|stop|start|close|reopen|review)\s+([^\s]+)/.exec(slack.text.trim());
  var verb = tokenized[1];
  var issue = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);
  var command = this;

  if (hasIssue) {
    var transitionId = '0';

    switch(verb) {
      case 'resolve':
        transitionId = '5'; break;
      case 'stop':
        transitionId = '301'; break;
      case 'start':
        transitionId = '4'; break;
      case 'reopen':
        transitionId = '3'; break;
      case 'close':
        transitionId = '2'; break;
      case 'review':
        transitionId = '711'; break;
    };

    var options = {
      issueKey: issue,
      transition: {
        transition: {
          id: transitionId,
        },
        fields: {
          'assignee': { name: slack.user_name },
        }
      }
    };

    jira.issue.transitionIssue(options, (err, confirm) => {
      if (err) {
        return command.buildResponse('oops. i was unable to transition the issue.');
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(config.slack);
        message.setText(text);
        message.setReplyAll();
        message.addAttachment({
          title: slack.user_name + ' has transitioned ' + issue + ' to ' + verb,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' has transitioned ' + issue + ' to ' + verb,
          color: 'good'
        });
        message.setChannel(slack.channel_id);
        message.setUsername(slack.user_id);
        message.post();
      }
    });
  } else if (user) {
    return command.buildResponse('i need a valid issue to transition.');
  } else {
    return command.buildResponse('you forgot to tell me which issue to transition.');
  }
});

transition.setHelp('_resolve|stop|close|reopen|start|review_ issueKey', 'transitions an issue to a new status. possible choices are resolve, stop, start, review or reopen');

module.exports = transition;
