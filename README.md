# authorizing jira

first, you'll want to generate a new private/public key for this app to be used by jira.
then you'll need to set up a new application link in jira (https://github.com/floralvikings/jira-connector). 
it will ask for a URL, but you don't have to have one up and running to proceed.

## oauth

to authorize by oauth, after setting up the application link, run the following

```
var JiraClient = require('jira-connector');

JiraClient.oauth_util.getAuthorizeURL({
    host: 'host-of-your-jira',
    oauth: {
        consumer_key: 'consumer-name-given-in-jira',
        private_key: '-----BEGIN RSA PRIVATE KEY-----\n' +
        'generate your own private/public key' +
        'put your private key here and your public key in jira' +
        '-----END RSA PRIVATE KEY-----\n'
    }
}, function (error, oauth) {
    console.log(oauth);
    // this will print out an authorization url and token and a token secret
    // visit the url to get a confirmation key
});
```

after that run the following

```
var JiraClient = require('jira-connector');

JiraClient.oauth_util.swapRequestTokenWithAccessToken({
    host: 'host-of-your-jira',
    oauth: {
        token: 'given-by-getAuthorizeUrl',
        token_secret: 'given-by-getAuthorizeUrl',
        oauth_verifier: 'given-by-visiting-url-from-getAuthorizeUrl',
        consumer_key: 'consumer-name-given-in-jira',
        private_key: '-----BEGIN RSA PRIVATE KEY-----\n' +
        'generate your own private/public key' +
        'put your private key here and your public key in jira' +
        '-----END RSA PRIVATE KEY-----\n'
    }
}, function (error, oauth) {
    console.log(oauth);
    // this will print out a permenant access token you can now use
});
```

this will give you all the credentials you need to connect to jira by oauth. please be aware, that if you use aws lambda, getting oauth to work is tricky because there is a node v0.10 bug with node's crypto signing and with python you need to package up the oauth and crypto libraries. 

it will be easier to use if you are running your own service...

## username / password

this will be easiest to set up and get things running...

## base64

jira also supports sending down a base64 of 'username:password'. to generate this, just run

```
echo -n 'username:password' | base64
```

# install

## npm

install the package directly from github with npm

```
npm install git@github.com:coursera/buggy.git
```

## configure buggy

copy config.js.template.txt into your module and add in your own parameters to authenticate to jira and slack

below are the params you will need to define

```
{
  slack: {
    apiToken: '', // generate this on slack
    token: '', // generate this on slack
    webhook: '', // generate this on slack
    botName: 'buggy', //name it whatever you want
    botIconEmoji: 'bug' // assign the bot an emoji icon
    // botIconUrl: '' // or assign it to some hosted image somewhere
  },
  jira: {
    host: '',
    basic_auth: {
      /*
      username: '',
      password: '',
      */
      base64: ''
    }
    /*
    oauth: {
      token: '',
      token_secret: '',
      consumer_key: '',
      private_key: '-----BEGIN RSA PRIVATE KEY-----\n' +
                   'alskdjflaskjflsdf' +
                   '-----END RSA PRIVATE KEY-----\n'
    }
    */
  }
};
```

## wire up this router to an existing express server

this module exposes a modular express router that can be wired up to any existing express router. 

here is an example of how to do that:

```
  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var fs = require('fs');
  var path = require('path');
  var vhost = require('vhost');
  var buggy = require('buggy');
  var buggyConfig = require('./config.buggy.js');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/buggy', buggy(config));

  var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
  });
```
