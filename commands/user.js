var Message = require('../slack/message');
var Command = require('../slack/command');
var WebClient = require('@slack/client').WebClient;

var user = new Command('user', (slack, jira, config, command) => {
  var tokenized = /(user\s*)?(.+)/.exec(slack.text.trim());
  var user = tokenized[2];
  var email = '';
  user = user.replace(/^@/, '');

  var web = new WebClient(config.apiToken);

  web.users.list({presence:false}, (slack_error, slack_results) => {
    if (slack_error) {
      var errMessage = `i'm sorry but i'm having trouble looking ${user} up in slack`;
      command.reply(slack.response_url, errMessage);
    } else {
      for (var member in slack_results.members) {
        if (member.name == user) {
          email = member.profile.email;
        }
      }
      if (email) {
        jira.search.search({'jql':`assignee = "${email}" AND resolution = Unresolved order by updated DESC`}, (jira_error, jira_results) => {
          if (err) {
            var errMessage = `i'm sorry but i'm having trouble looking ${user} up in jira`;
            command.reply(slack.response_url, errMessage);
          } else {
            var message = new Message(config.slack);
            message.setText(slack.command + ' ' + slack.text);

            for (var i = 0; i < Math.min(jira_results.total, 10); i++) {
              message.attachIssue(jira_results.issues[i], config.jira.host, true);
            }

            message.postAsWebHook(slack.user_name);
          }
        });
      } else {
        var errMessage = `i'm sorry but ${user} does not exist in slack`;
        command.reply(slack.response_url, errMessage);
      }
    }
  });

  return command.buildResponse('okay, gimme a sec while i look for any unresolved issues you are working on');
});

user.setHelp('@user', 'search for any unresolve issues assigned to a user');

module.exports = user;
