var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');
var fs = require('fs');

var help = new Command(/help/, function(slack, jira, context) {
  var text = "i can do many buggy things, like:\n\n";

  fs.readdirSync('./commands').forEach(function(file) {
    if (file != 'help.js') {
      var command = require('./' + file);
      if (command && command.getHelp) {
        var commandHelp = command.getHelp();
        if (commandHelp) {
          text += '\t' + slack.command + ' ' + commandHelp.command + '\n';
          text += '\t' + commandHelp.text + '\n\n';
        }
      }
    } else {
      text += '\t' + slack.command + 'help\n';
      text += '\thelps you again and again\n\n';
    }
  });

  text += '\t' + slack.command + ' ?\n';
  text += '\tand SO MUCH MOAR ...';

  var message = new Message(text);
  response.sendTo(slack.user_name, message, context.done);
});

module.exports = help;
