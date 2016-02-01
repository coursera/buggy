var request = require('request');
var config = require('../config');
var SlackApi = require('slack-node');

module.exports = {
  send: function(url, message, callback) {

    var options = {
      url: url,
      method: 'POST',
      json: message.getResponse()
    };

    request(options, function(error, res, body) {
      callback();
    });
  },

  sendTo: function(user, message, callback) {
    message.setUsername(config.slack.botName);

    if (config.slack.botIconUrl) {
      message.setIconUrl(config.slack.iconUrl);
    } else {
      message.setIconEmoji(config.slack.botIconEmoji)
    }

    message.setChannel('@' + user);

    var options = {
      url: config.slack.webhook,
      method: 'POST',
      json: message.getResponse()
    };

    request(options, function(error, res, body) {
      callback();
    });
  },

  sendFrom: function(user_id, channel_id, message, callback) {
    message.setChannel(channel_id);

    var slackApi = new SlackApi(config.slack.apiToken);
    slackApi.api('users.info', {user:user_id}, function(err, res) {

      if (!err && res.user) {
        message.setUsername(res.user.name);
        message.setIconUrl(res.user.profile.image_72);
      }

      var options = {
        url: config.slack.webhook,
        method: 'POST',
        json: message.getResponse()
      };

      request(options, function(error, res, body) {
        callback();
      });
    });
  }
};
