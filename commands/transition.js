var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

// submit for review is 711
// stop progress is 301
var transition = new Command(/resolve|stop|start|close|reopen|review/, function(slack, jira, context) {
  var tokenized = /(resolve|stop|start|close|reopen|review)\s+([^\s]+)/.exec(slack.text.trim());
  var verb = tokenized[1];
  var issue = tokenized[2];
  var hasIssue = /(\w+)-(\d+)/.test(issue);

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
        }/*,
        fields: {
          'assignee': { name: slack.user_name },
        }
        */
      }
    };

    jira.issue.transitionIssue(options, function(err, confirm) {
      if (err) {
        console.log(err);
        var errMessage = new Message('oops. i was unable to transition the issue.');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var text = slack.command + ' ' + slack.text;
        var message = new Message(text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' has transitioned ' + issue + ' to ' + verb,
          title_link: 'https://' + jira.host + '/browse/' + issue,
          fallback: slack.user_name + ' has transitioned ' + issue + ' to ' + verb,
          color: 'good'
        });
        response.sendFrom(slack.user_id, slack.channel_id, message, context.done);
      }
    });
  } else if (user) {
    var noMessage = new Message('i need a valid issue to transition.');
    response.send(slack.response_url, noMessage, context.done);
  } else {
    var badMessage = new Message('you forgot to tell me which issue to transition.');
    response.send(slack.response_url, badMessage, context.done);
  }
});

transition.setHelp('_resolve|stop|close|reopen|start|review_ issueKey', 'transitions an issue to a new status. possible choices are resolve, stop, start, review or reopen');

module.exports = transition;
