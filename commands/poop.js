var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/poop|poo/, (slack, jira, config, command) => {
  return command.buildResponse(':poop:');
});
