var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');
var fs = require('fs');
var path = require('path');

var help = new Command(/help/, function(slack, jira, context) {
  var tokenized = /help(?:\s+([^\s]+))?/.exec(slack.text.trim());
  var command = tokenized[1];

  var fullHelp = !command;
  var text = fullHelp ? '' : 'i can do many buggy things, like:\n\n';

  fs.readdirSync('./commands').forEach(function(file) {
    var moduleName = path.basename(file, '.js');
    if (moduleName != 'help') {
      var module = require('./' + file);
      if (module && module.getHelp) {
        var commandHelp = module.getHelp();

        if (commandHelp) {
          if (fullHelp) {
            text += slack.command + ' ' + commandHelp.command + '\n';
          } else if (module.matches(command)) {
            text += slack.command + ' ' + commandHelp.command + '\n' + commandHelp.text + '\n';
          }
        }
      }
    } else if (fullHelp) {
      text += slack.command + 'help\n';
    } else if (command === 'help') {
      text += slack.command + 'help\n';
      text += 'helps you again and again\n\n';
    }
  });

  if (!fullHelp) {
    text += slack.command + ' ?\n';
  } else if (command && text === '') {
    text += 'i can not help you with _' + command + '_ right now.';
  }

  var message = new Message(text);
  response.sendTo(slack.user_name, message, context.done);
});

module.exports = help;
