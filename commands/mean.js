var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/die|leave/, (slack, jira) => {
  return this.buildResponse('that hurts. please be nice.');
});
