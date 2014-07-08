# Uber Chat

Created with specifications from Boston.com

## Usage
```js
$('#test-1').uberchat();
```
## Options

```js
{
  publish_key: 'demo',
  subscribe_key: 'demo',
  instance: '1',
  domain: 'pubnub.com',
  username: 'guest',
  title: 'Lobby Chat',
  admins: []
}
```

Property | Type | Notes
-------------------
publish_key | String | Custom PubNub publish key.
subscribe_key | String | Custom PubNub subscribe key.
instance | String | A unique identifier for each chatroom.
domain | String | Ability to separate chat via domains. Useful if ids overlap.
username | String | The username for this client.
title | String | The title of the chat that appears on the panel.
admins | Array | An array of usernames that should have special admin styling.


## Testing

```
python -m SimpleHTTPServer
```
## Examples

### Using custom PubNub Keys
```js
// test with custom keys
$('#test-2').uberchat({ 
subscribe_key: 'sub-c-5faa8f16-06e1-11e4-a211-02ee2ddab7fe',
publish_key: 'pub-c-5984ffe6-3030-48f3-8b42-c045fac5e76f',
title: 'Custom Keys',
instance: 2
});
```

### Adding your own username
```js
// test with custom username
$('#test-3').uberchat({
title: 'Custom username: ' + whoami,
username: 'Ian',
instance: 3
});
```

### Special styling for admins
```js
// test with admin
$('#test-4').uberchat({ 
title: 'You are admin: ' + whoami,
username: 'Ian',
admins: ['Joe', 'Ian'],
instance: 4
});
```

### Embeding the same instance twice
```js
// test with custom username
$('#test-5').uberchat({ 
title: 'Same Instance as chat to the right.',
instance: 5
});

// test with custom username
$('#test-6').uberchat({ 
title: 'Same instance as chat to the left.',
instance: 5
});
```