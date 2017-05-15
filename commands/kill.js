var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command('kill', (slack, jira, config) => {
  return this.buildResponse('try as you might, you will never kill all the bugs!');
});
