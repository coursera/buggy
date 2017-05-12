var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');
var SlackUtils = require('../slack/util');

var create = new Command('create', function(slack, jira, config) {
  var tokenized = /create (\w+) \s*([^|]+)(?:\s*\|\s*(.+)\s*)?/.exec(slack.text.trim());
  var slackPermalink = SlackUtils.createPermalink(slack.team_domain, slack.channel_name);
  
  if (tokenized && tokenized.length >= 3) {
    var projectKey = tokenized[1].toUpperCase();
    var summary = tokenized[2];
    var description = tokenized[3] || '';

    if (slackPermalink !== null) {
      description += '\n\nSlack conversation where this bug was reported: ' + slackPermalink;
    }

    description += '\n\nSlack user who created this bug: ' + slack.user_name;

    var fields = {
      project: {key: projectKey},
      summary: summary,
      // reporter: {name: slack.user_name}, // causes problems
      labels: ["buggy-made-this"],
      issuetype: { name: "Bug" },
      description: description
    };

    jira.issue.createIssue({fields:fields}, function(err, issue) {
      if (err) {
        var errMessage = new Message('i was not able to create anything.');
        response.send(slack.response_url, errMessage);
      } else {
        var message = new Message(slack.command + ' ' + slack.text);
        message.setResponseType(true);
        message.addAttachment({
          title: slack.user_name + ' created ' + issue.key,
          title_link: 'https://' + jira.host + '/browse/' + issue.key,
          fallback: slack.user_name + ' created ' + issue.key,
          color: 'good'
        });

        var options = {
          issueKey: issue.key,
          issue: {
            update: {
              reporter:[{set: slack.user_name}]
            }
          }
        };

        jira.issue.editIssue(options, function(err, confirm) {
          response.sendFrom(slack.user_id, slack.channel_id, message, config.slack);
        });
      }
    });
  } else {
    return new Message('i need a project and a description to create issues');
  }
});

create.setHelp('create projectKey _a title_ [ | _a description_ ]', 'create a new issue');

module.exports = create;
