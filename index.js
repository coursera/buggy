var express = require('express');
var router = express.Router();
var url = require('url');
var qs = require('querystring');
var JiraConnector = require('jira-connector');
var fs = require('fs');

module.exports = function(config) {

  router.post('/', (req, res) => {
    var params = req.body;
    var requestToken = params.token;
    var jira = new JiraConnector(config.jira);
    var commandText = (params.text || '').split(' ')[0];
    var commandDefault;
    var commandRun = false;
    var commands = fs.readdirSync(__dirname + '/commands');
  
    if (requestToken !== config.slack.token) {
      res.status(403).send('Invalid request token ' + requestToken);
    } else {
      while(commands.length > 0) {
        var module = commands.pop();
        var command = require(__dirname + '/commands/' + module);
  
        if (command.matches(commandText)) {
          commandRun = true;
          var message = command.run(params, jira, config);
  
          if (message) {
            res.json(message);
          } else {
            res.send('');
          }
          break;
        } else if (command.isDefault()){
          commandDefault = command;
        }
      };
  
      if (!commandRun) {
        if (commandDefault && params) {
          var message = commandDefault.run(params, jira, config);
          if (message) {
            res.json(message);
          } else {
            res.send('');
          }
        } else {
          res.status(500);
        }
      }
    }
  });

  return router;
};
