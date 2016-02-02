var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');
var SlackUtils = require('../slack/util');

var create = new Command('create', function(slack, jira, context) {
  var tokenized = /create (\w+) \s*([^|]+)(?:\s*\|\s*(.+)\s*)?/.exec(slack.text.trim());
  var projectKey = tokenized[1].toUpperCase();
  var summary = tokenized[2];
  var description = tokenized[3] || '';

  var slackPermalink = SlackUtils.createPermalink(slack.team_domain, slack.channel_name);
  
  if (slackPermalink !== null) {

    // Add some spacing if there's a user-supplied description too
    if (description.length) {
      description += '\n\n';
    }

    description += 'Slack conversation where this bug was reported: ' + slackPermalink;
  }

  if (projectKey && summary) {
    var fields = {
      project: {key: projectKey},
      summary: summary,
      reporter: {name: slack.user_name},
      labels: ["buggy-made-this"],
      issuetype: { name: "Bug" },
      description: description
    };

    jira.issue.createIssue({fields:fields}, function(err, issue) {
      if (err) {
        var errMessage = new Message('i was not able to create anything.');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var message = new Message(slack.command + ' ' + slack.text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' created ' + issue.key,
          title_link: 'https://' + jira.host + '/browse/' + issue.key,
          fallback: slack.user_name + ' created ' + issue.key,
          color: 'good'
        });

        response.sendFrom(slack.user_id, slack.channel_id, message, context.done);
      }
    });
  } else {
    var noMessage = Message('you forgot to tell me what to create!');
    response.send(slack.response_url, noMessage, context.done);
  }
});

create.setHelp('create projectKey title here [ | description here ]', 'create a new issue');

module.exports = create;
