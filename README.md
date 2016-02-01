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

# lambda

## creating your function

create a new function on lambda using a node blueprint.

you'll now need to configure the API gateway to not require authentication, so the apis can be publicly accessible.

this script responds to slack using the delayed response method, but lambda still forces a null to be returned. turn off these responses if you don't want slack to see these. follow the instructions here on how to do that: https://medium.com/@farski/learn-aws-api-gateway-with-the-slack-police-ca8d636e9fc0#.gyf8r77cr

please be warned, lambda only allows node v0.10. that means no es6 and problems with oauth.

## packaging and uploading

assuming you have 'zip' and the aws cli installed, run the below to zip up your scripts and upload them

```  
#!/usr/bin/env bash

zip -qr ../buggy.zip *
aws lambda update-function-code --function-name your-function-name --zip-file fileb://../buggy.zip
```
