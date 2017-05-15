var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command('kill', (slack, jira, config, command) => {
  return command.buildResponse('try as you might, you will never kill all the bugs!');
});
