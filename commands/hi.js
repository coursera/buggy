var Message = require('../slack/message');
var Command = require('../slack/command');

module.exports = new Command(/hi|hola|yo|hello/, (slack, jira) => {
  return this.buildResponse('hi, i\'m buggy, i hope you are having a bug free day!');
});
