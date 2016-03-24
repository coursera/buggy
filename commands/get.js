var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var userCommand = require('./user');
var searchCommand = require('./search');

var get = new Command(/get/, function(slack, jira) {
  var tokenized = /(get\s*)?(.+)/.exec(slack.text.trim());
  var getIssue = tokenized ? tokenized[2] : '';
  var hasIssue = /(\w+)-(\d+)/.test(getIssue);

  if (hasIssue) {
    jira.issue.getIssue({'issueKey':getIssue}, function(err, issue) {
      if (err) {
        var errMessage = new Message('i\'m sorry but i couldn\'t find bug ' + getIssue + ', maybe it doesn\'t exist?');
        response.send(slack.response_url, errMessage);
      } else {
        var message = new Message(slack.command + ' ' + slack.text);
        message.setResponseType(true);
        message.attachIssue(issue);

        response.sendFrom(slack.user_id, slack.channel_id, message);
      }
    });
  } else {
    if (/^@/.test(getIssue)) {
      return userCommand.run(slack, jira);
    } else if (/^("|“|').+("|'|”)$/.test(getIssue)) {
      return searchCommand.run(slack, jira);
    } else if (!getIssue) {
      return new Message('yes?');
    } else {
      var badText = 'sorry, but i don\'t know how to "' + slack.text + '". try "help" instead.';
      return new Message(badText);
    }
  }
});

get.setHelp('issueKey', 'retrieve an issue');
get.setDefault(true);

module.exports = get;
