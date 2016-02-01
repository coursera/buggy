var AWS = require('aws-sdk');
var url = require('url');
var qs = require('querystring');
var config = require('./config');
var JiraConnector = require('jira-connector');
var fs = require('fs');

exports.handler = function (event, context) {
  var params = qs.parse(event.postBody);
  var requestToken = params.token;
  var jira = new JiraConnector(config.jira);
  var commandText = (params.text || '').split(' ')[0];
  var commandDefault;
  var commandRun = false;
  var commands = fs.readdirSync('./commands');

  if (requestToken !== config.slack.token) {
    context.fail("Invalid request token " + requestToken);
  } else {
    while(commands.length > 0) {
      var module = commands.pop();
      var command = require('./commands/' + module);

      if (command.matches(commandText)) {
        commandRun = true;
        command.run(params, jira, context);
        break;
      } else if (command.isDefault()){
        console.log('found default command');
        commandDefault = command;
      }
    };

    if (!commandRun) {
      if (commandDefault) {
        commandDefault.run(params, jira, context);
      } else {
        context.fail();
      }
    }
  }
};
