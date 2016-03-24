var request = require('request');
var SlackApi = require('slack-node');

module.exports = {
  send: function(url, message) {

    var options = {
      url: url,
      method: 'POST',
      json: message.getResponse()
    };

    return new Promise((resolve, reject) => { 
      request(options, (error, res, body) => { 
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
  },

  sendTo: function(user, message, config) {
    message.setUsername(config.botName);

    if (config.botIconUrl) {
      message.setIconUrl(config.iconUrl);
    } else {
      message.setIconEmoji(config.botIconEmoji)
    }

    message.setChannel('@' + user);

    var options = {
      url: config.webhook,
      method: 'POST',
      json: message.getResponse()
    };

    return new Promise((resolve, reject) => { 
      request(options, (error, res, body) => { 
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
  },

  sendFrom: function(user_id, channel_id, message, config) {
    message.setChannel(channel_id);

    var slackApi = new SlackApi(config.apiToken);
    slackApi.api('users.info', {user:user_id}, function(err, res) {

      if (!err && res.user) {
        message.setUsername(res.user.name);
        message.setIconUrl(res.user.profile.image_72);
      }

      var options = {
        url: config.webhook,
        method: 'POST',
        json: message.getResponse()
      };

      return new Promise((resolve, reject) => { 
        request(options, (error, res, body) => { 
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
      });
    });
  }
};
