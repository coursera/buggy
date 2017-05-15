var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command('null', (slack, jira) => {
  return null;
});
