var Message = require('../slack/message');
var Command = require('../slack/command');
var SlackUtil = require('../slack/util');

var search = new Command('search', (slack, jira, config, command) => {
  var tokenized = /(search\s*)?(.+)/.exec(slack.text.trim());

  if (tokenized.length > 2) {
    var text = tokenized[2];

    if (/^".+"$/.test(text)) {
      text = text.replace(/^"/, '').replace(/"$/, '');
    }

    text = text.replace(/"/g, '\\"');

    jira.search.search({'jql':'text ~ "' + text + '" AND Status not in (Resolved, Closed)'}, function(err, results) {
      if (err) {
        var errMessage = ('i\'m sorry but i couldn\'t find anything. maybe it doesn\'t exist?');
        command.reply(slack.response_url, errMessage);
      } else {
        var message = new Message(config.slack);
        message.setText(slack.command + ' ' + slack.text);

        for (var i = 0; i < Math.min(results.total, 10); i++) {
          message.addAttachment(SlackUtil.jiraIssueToAttachment(results.issues[i], config.jira.host, true));
        }

        message.postAsWebHook(slack.user_name);
      }
    });

    return command.buildResponse('okay, i\'m searching jira for you right now, gimme a sec');
  } else {
    return command.buildResponse('you forgot to tell me what to search for!');
  }
});

search.setHelp("\"search string\"", "search only open issues");

module.exports = search;
