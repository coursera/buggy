var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command('null', (slack, jira, config, command) => {
  return null;
});
