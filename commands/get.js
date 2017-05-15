var Message = require('../slack/message');
var Command = require('../slack/command');
var SlackUtil = require('../slack/util');

var userCommand = require('./user');
var searchCommand = require('./search');

var get = new Command(/get/, (slack, jira, config, command) => {
  var tokenized = /(get\s*)?(.+)/.exec(slack.text.trim());
  var getIssue = tokenized ? tokenized[2] : '';
  var hasIssue = /(\w+)-(\d+)/.test(getIssue);

  if (hasIssue) {
    jira.issue.getIssue({'issueKey':getIssue}, function(err, issue) {
      if (err) {
        var errMessage = 'i\'m sorry but i couldn\'t find bug ' + getIssue + ', maybe it doesn\'t exist?';
        command.reply(slack.response_url, errMessage, 'in_channel');
      } else {
        var message = new Message(config.slack);
        message.setText(slack.command + ' ' + slack.text);
        message.setReplyAll();
        message.setUsername(slack.user_id);
        message.addAttachment(SlackUtil.jiraIssueToAttachment(issue, config.jira.host));
        message.setChannel(slack.channel_id);
        message.post();
      }
    });
  } else {
    if (/^@/.test(getIssue)) {
      return userCommand.run(slack, jira, config);
    } else if (/^("|“|').+("|'|”)$/.test(getIssue)) {
      return searchCommand.run(slack, jira, config);
    } else if (!getIssue) {
      return command.buildResponse('yes?');
    } else {
      var badText = 'sorry, but i don\'t know how to "' + slack.text + '". try "help" instead.';
      return command.buildResponse(badText);
    }
  }
});

get.setHelp('issueKey', 'retrieve an issue');
get.setDefault(true);

module.exports = get;
