var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

var search = new Command('search', function(slack, jira, context) {
  var tokenized = /(search\s*)?(.+)/.exec(slack.text.trim());

  if (tokenized.length > 2) {
    var text = tokenized[2];

    if (/^".+"$/.test(text)) {
      text = text.replace(/^"/, '').replace(/"$/, '');
    }

    text = text.replace(/"/g, '\\"');

    jira.search.search({'jql':'text ~ "' + text + '" AND Status not in (Resolved, Closed)'}, function(err, results) {
      if (err) {
        var errMessage = new Message('i\'m sorry but i couldn\'t find anything. maybe it doesn\'t exist?');
        response.send(slack.response_url, errMessage, context.done);
      } else {
        var message = new Message(slack.command + ' ' + slack.text);
        message.setResponseType(true);

        for (var i = 0; i < Math.min(results.total, 10); i++) {
          message.attachIssue(results.issues[i], true);
        }

        response.sendTo(slack.user_name, message, context.done);
      }
    });
  } else {
    var noMessage = new Message('you forgot to tell me what to search for!');
    response.send(slack.response_url, noMessage, context.done);
  }
});

search.setHelp("\"search string\"", "search only open issues");

module.exports = search;
