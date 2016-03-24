var Command = function(matcher, handler) {
  this.matcher = matcher;
  this.handler = handler;
  this._isDefault = false;
};

Command.prototype.setHelp = function(command, text) {
  this.help = {
    command: command,
    text: text
  };
};

Command.prototype.run = function(slack, jira, context) {
  return this.handler(slack, jira, context);  
};

Command.prototype.getHelp = function() {
  return this.help;
};

Command.prototype.setDefault = function(isDefault) {
  this._isDefault = isDefault;
};

Command.prototype.isDefault = function() {
  return this._isDefault;
};

Command.prototype.matches = function(command) {
  return (this.matcher instanceof RegExp) ? this.matcher.test(command) : this.matcher === command;
};

module.exports = Command;
