var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/die|leave/, (slack, jira, config, command) => {
  return command.buildResponse('that hurts. please be nice.');
});
