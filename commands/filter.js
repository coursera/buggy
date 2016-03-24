var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var filter = new Command('filter', function(slack, jira, config) {
  var tokenized = slack.text.trim().split(' ');

  if (tokenized.length > 1) {
    tokenized.shift();

    var jql = tokenized.join(' ').replace(/"/g, '\"');

    jira.search.search({'jql':jql}, function(err, results) {
      if (err) {
        var errMessage = new Message(' ... looks like your filtered everything out!');
        response.send(slack.response_url, errMessage);
      } else {
        var message = new Message(slack.command + ' ' + slack.text);
        message.setResponseType(true);

        for (var i = 0; i < Math.min(results.total, 10); i++) {
          message.attachIssue(results.issues[i], config.jira.host, true);
        } 

        response.sendTo(slack.user_name, message, config.slack);
      }
    });
  } else {
    return new Message('you forgot to tell me what filter you want to use!');
  }
});

filter.setHelp('filter jql', 'filter issuers using jira query language');

module.exports = filter;
