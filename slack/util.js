var SlackUtils = {
  createPermalink: function(team_domain, channel_name) {
    if (channel_name && channel_name !== 'directmessage') {
      var timestamp = Date.now() * 1000;
      return 'https://' + team_domain + '.slack.com/archives/' + channel_name + '/s' + timestamp;
    } else {
      return null;
    }
  }
};

module.exports = SlackUtils;
