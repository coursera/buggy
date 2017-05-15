var Message = require('../slack/message');
var Command = require('../slack/command');
var WebClient = require('@slack/client').WebClient;

var me = new Command('me', (slack, jira, config, command) => {
  var web = new WebClient(config.apiToken);

  web.users.info(slack.user_id, (slack_error, slack_results) => {
    if (slack_error) {
      var errMessage = ('i\'m sorry but i\'m having trouble looking you up in slack!');
      command.reply(slack.response_url, errMessage);
    } else {
      jira.search.search({'jql':`assignee = "${slack_results.user.profile.email}" AND resolution = Unresolved order by updated DESC`}, (jira_error, jira_results) => {
        if (err) {
          var errMessage = ('i\'m sorry but i having trouble looking up your bugs in jira');
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
    }
  });

  return command.buildResponse('okay, gimme a sec while i look for any unresolved issues you are working on');
});

me.setHelp("", "search for any unresolved issues assigned to you");

module.exports = me;
