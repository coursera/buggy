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
    var fields = {};
    var details = {};
    var detailsSplit = (tokenized[3] || '').split('|');

    fields.project = {key: projectKey};
    fields.summary = summary;
    fields.labels = ["buggy-made-this"];
    fields.issuetype = { name: "Bug" };
    fields.description = '';

    for(var detail of detailsSplit) {
      var detailSplit = detail.trim().split('=');
      if (detailSplit.length == 2) {
        var name = detailSplit[0];
        var value = detailSplit[1];
        switch(name) {
          case 'component':
          case 'components':
            fields.components = [];
            for(var component of value.split(',')) {
              fields.components.push({name:component});
            }
            break;
          case 'label':
          case 'labels':
            fields.labels = detail.labels.split(',').concat(["buggy-made-this"]);
            break;
          case 'issuetype':
            fields.issuetype = {name:value};
            break;
          default:
            fields[name] = value;
            break;
        }
      }
    }

    if (slackPermalink !== null) {
      fields.description += '\n\nSlack conversation where this bug was reported: ' + slackPermalink;
    }

    fields.description += '\n\nSlack user who created this bug: ' + slack.user_name;

    jira.issue.createIssue({fields:fields}, function(err, issue) {
      if (err) {
        var errMessage = new Message('i was not able to create an issue because: ' + JSON.stringify(err));
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

create.setHelp('create projectKey _a title_ [ | field = value | field2 = value2 | field3 = value3 ]', 'create a new issue');

module.exports = create;
