var Message = function(text) {
  this.response = {};

  this.setText(text);
  this.setResponseType(false);
}

Message.prototype.getResponse = function() {
  return this.response;
};

Message.prototype.setText = function(text) {
  this.response.text = text;
};

Message.prototype.setResponseType = function(inChannel) {
  this.response.response_type = inChannel ? 'in_channel' : 'ephemeral';
};

Message.prototype.addAttachment = function(attachment) {
  this.response.attachments = this.response.attachments || [];
  this.response.attachments.push(attachment);
};

Message.prototype.setUsername = function(user) {
  this.response.username = user;
};

Message.prototype.setIconUrl = function(url) {
  this.response.icon_url = url;
};

Message.prototype.setIconEmoji = function(emoji) {
  this.response.icon_emoji = ':' + emoji + ':';
};

Message.prototype.setChannel = function(channel) {
  this.response.channel = channel;
};

Message.prototype.attachIssue = function(issue, host, brief) {
  var attachment = {
    "title": issue.fields.summary ? issue.key + ': ' + issue.fields.summary : issue.key,
    "title_link": 'https://' + host + '/browse/' + issue.key,
    "fallback": (issue.fields.summary || '') + 'https://' + host + '/browse/' + issue.key,
    //"thumb_url": issue.fields.project.avatar,
    //"pretext": "",
  };

  if (issue.fields.status && issue.fields.priority) {
    attachment.color = /Done|Resolved|Closed/.test(issue.fields.status.name) ? 'good' : 
      /Critical|Major/.test(issue.fields.priority.name) ? 'danger' : 'warning'
  };

  if (!brief) {
    attachment.text = issue.fields.description || '';
    attachment.fields = [
      {
        "title": "Assignee",
        "value": issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
        "short": true 
      },
      {
        "title": "Status",
        "value": issue.fields.status ? issue.fields.status.name : 'Open',
        "short": true 
      }
    ]
  };

  this.addAttachment(attachment);
};

module.exports = Message;
