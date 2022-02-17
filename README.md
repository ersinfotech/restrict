# Restrict

ERS auth middleware

## Installation

```sh
$ npm i --save ersinfotech/restrict
```

## API

```js
var express = require('express');
var Restrict = require('@ersinfotech/restrict');

var app = express();
var restrict = Restrict({
	baseUrl: 'http://authUrl',
	oauth: {
		crypt_key: 'crypt_key'
		sign_key: 'sign_key'
		accessTokenTTL: 12 * 60 * 60 * 1000
	},
});

app.use(restrict());
```

## License

MIT