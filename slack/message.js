var Message = function(config) {
  this.options = {};
  this.config = config;
}

Message.prototype.getOptions = function() {
  return this.options;
};

Message.prototype.setText = function(text) {
  this.text = text;
};

Message.prototype.getText = function(text) {
  return this.text;
};

Message.prototype.setChannel = function(channel) {
  this.channel = channel;
};

Message.prototype.getChannel = function() {
  return this.channel;
};

Message.prototype.setReplyAll = function() {
  this.options.reply_broadcast = true;
};

Message.prototype.setReplyTo = function(thread_ts) {
  this.options.thread_ts = thread_ts;
  this.options.reply_broadcast = true;
};

Message.prototype.addAttachment = function(attachment) {
  this.options.attachments = this.options.attachments || [];
  this.options.attachments.push(attachment);
};

Message.prototype.getAttachments = function(attachment) {
  return this.options.attachments;
};

Message.prototype.setUsername = function(user) {
  this.options.username = user;
  this.options.as_user = true;
};

Message.prototype.setIconUrl = function(url) {
  this.options.icon_url = url;
};

Message.prototype.setIconEmoji = function(emoji) {
  this.options.icon_emoji = ':' + emoji + ':';
};

Message.prototype.post = function() {
  var message = this;
  var web = new WebClient(message.config.apiToken);

  return new Promise((resolve, reject) => { 
    web.chat.postMessage(message.channel, message.text, message.options, (error, res) => {
      if (error) {
        reject(error);
      } else {
        resolve(res);
      }
    });
  });
}

Message.prototype.postAsWebHook = function(user) {
  var message = this;
  var webhook = new IncomingWebhook(message.config.webhook);
  var payload = {};

  if (message.text) {
    payload.text = message.text;
  }

  if (message.options.attachments) {
    payload.attachments = message.options.attachments;
  }

  if (message.channel) {
    payload.channel = message.channel;
  }

  if (message.options.username) {
    payload.username = message.options.username;
  }

  if (message.options.icon_emoji) {
    payload.iconEmoji = message.options.icon_emoji;
  }

  if (message.options.icon_url) {
    payload.iconUrl = message.options.icon_url;
  }

  if (message.options.username) {
    payload.username = message.options.username;
  }

  return new Promise((resolve, reject) => { 
    webhook.send(payload, (error, res) => {
      if (error) {
        reject(error);
      } else {
        resolve(res);
      }
    });
  });
};

module.exports = Message;
