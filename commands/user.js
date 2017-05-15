var Message = require('../slack/message');
var Command = require('../slack/command');
var WebClient = require('@slack/client').WebClient;
var SlackUtil = require('../slack/util');

var user = new Command('user', (slack, jira, config, command) => {
  var tokenized = /(user\s*)?(.+)/.exec(slack.text.trim());
  var user = tokenized[2];
  var email = '';
  user = user.replace(/^@/, '');

  var web = new WebClient(config.slack.apiToken);

  web.users.list({presence:false}, (slack_error, slack_results) => {
    if (slack_error) {
      var errMessage = `i'm sorry but i'm having trouble looking ${user} up in slack`;
      command.reply(slack.response_url, errMessage);
    } else {
      for (var member of slack_results.members) {
        if (member.name == user) {
          email = member.profile.email;
        }
      }
      if (email) {
        jira.search.search({'jql':`assignee = "${email}" AND resolution = Unresolved order by updated DESC`}, (jira_error, jira_results) => {
          if (jira_error) {
            var errMessage = `i'm sorry but i'm having trouble looking ${user} up in jira`;
            command.reply(slack.response_url, errMessage);
          } else {
            var message = new Message(config.slack);

            if (jira_results.total > 0) {
              message.setText(slack.command + ' ' + slack.text + `\n_${user} is assigned to ${jira_results.total} unresolved issues_\n`);
              for (var i = 0; i < Math.min(jira_results.total, 10); i++) {
                message.addAttachment(SlackUtil.jiraIssueToAttachment(jira_results.issues[i], config.jira.host, true));
              }
            } else {
              message.setText(`${user} doesn't have any unresolved issues! give them a hug.`);
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
