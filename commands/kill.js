var response = require('../slack/response');
var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command('kill', function(slack, jira, config) {
  return new Message('try as you might, you will never kill all the bugs!');
});
