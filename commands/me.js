var Message = require('../slack/message');
var Command = require('../slack/command');
var WebClient = require('@slack/client').WebClient;
var SlackUtil = require('../slack/util');

var me = new Command('me', (slack, jira, config, command) => {
  var web = new WebClient(config.slack.apiToken);

  web.users.info(slack.user_id, (slack_error, slack_results) => {
    if (slack_error) {
      var errMessage = ('i\'m sorry but i\'m having trouble looking you up in slack!');
      command.reply(slack.response_url, errMessage);
    } else {
      jira.search.search({'jql':`assignee = "${slack_results.user.profile.email}" AND resolution = Unresolved order by updated DESC`}, (jira_error, jira_results) => {
        if (jira_error) {
          var errMessage = ('i\'m sorry but i having trouble looking up your bugs in jira');
          command.reply(slack.response_url, errMessage);
        } else {
          var message = new Message(config.slack);

          if (jira_results.total > 0) {
            message.setText(slack.command + ' ' + slack.text + `\n_you are assigned to ${jira_results.total} unresolved issues_\n`);
            for (var i = 0; i < Math.min(jira_results.total, 10); i++) {
              message.addAttachment(SlackUtil.jiraIssueToAttachment(jira_results.issues[i], config.jira.host, true));
            }
          } else {
            message.setText('you don\'t have any unresolved assigned issues! you are my hero.');
          }

          message.postAsWebHook(slack.user_name);
        }
      });
    }
  });

  return command.buildResponse('okay, gimme a sec while i look for any unresolved issues you are working on');
});

me.setHelp("me", "search for any unresolved issues assigned to you");

module.exports = me;
