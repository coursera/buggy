var Message = require('../slack/message');
var Command = require('../slack/command');
var fs = require('fs');
var path = require('path');

var help = new Command(/help/, (slack, jira, config, command) => {
  var tokenized = /help(?:\s+([^\s]+))?/.exec(slack.text.trim());
  var commands = tokenized[1];

  var fullHelp = !commands;
  var text = fullHelp ? 'happy to help! i can do many buggy things, like:\n\n' : slack.command + ' ' + slack.text + '\n\n';

  fs.readdirSync(__dirname).forEach(function(file) {
    var moduleName = path.basename(file, '.js');
    if (moduleName != 'help') {
      var module = require('./' + file);
      if (module && module.getHelp) {
        var commandHelp = module.getHelp();

        if (commandHelp) {
          if (fullHelp) {
            text += slack.command + ' ' + commandHelp.command + '\n';
            text += commandHelp.text + '\n\n';
          } else if (module.matches(commands)) {
            text += slack.command + ' ' + commandHelp.command + '\n' + commandHelp.text + '\n';
          }
        }
      }
    } else if (fullHelp) {
      text += slack.command + ' help\n';
    } else if (commands === 'help') {
      text += slack.command + ' help\n';
      text += 'helps you again and again\n\n';
    }
  });

  if (fullHelp) {
    text += slack.command + ' ?\n';
  } else if (commands && text === '') {
    text += 'i can not help you with _' + commands + '_ right now.';
  }

  return command.buildResponse(text);
});

module.exports = help;
