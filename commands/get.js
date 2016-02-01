var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var userCommand = require('./user');
var searchCommand = require('./search');

var get = new Command(/get/, function(slack, jira, context) {
  var tokenized = /(get\s*)?(.+)/.exec(slack.text.trim());
  var getIssue = tokenized ? tokenized[2] : '';
  var hasIssue = /(\w+)-(\d+)/.test(getIssue);

  if (hasIssue) {
    jira.issue.getIssue({'issueKey':getIssue}, function(err, issue) {
      if (err) {
        var errMessage = new Message('i\'m sorry but i couldn\'t find bug ' + getIssue + ', maybe it doesn\'t exist?');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var message = new Message(slack.command + ' ' + slack.text);
        message.setResponseType(true);
        message.attachIssue(issue);

        response.sendFrom(slack.user_id, slack.channel_id, message, context.done);
      }
    });
  } else {
    if (/^@/.test(getIssue)) {
      userCommand.run(slack, jira, context);
    } else if (/^".+"$/.test(getIssue)) {
      searchCommand.run(slack, jira, context);
    } else if (!getIssue) {
      response.send(slack.response_url, new Message('yes?'), context.done);
    } else {
      var badText = 'sorry, but i don\'t know how to "' + slack.text + '". try "help" instead.';
      response.send(slack.response_url, new Message(badText), context.done);
    }
  }
});

get.setHelp('issueKey', 'retrieve an issue');
get.setDefault(true);

module.exports = get;
