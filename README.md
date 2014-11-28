# Restrict

ERS auth middleware

## Installation

```sh
$ npm i --save ersinfotech/restrict
```

## API

```js
var express = require('express');
var Restrict = require('restrict');

var app = express();
var restrict = Restrict({baseUrl: 'http://authUrl'});

app.use(restrict('some permission'));
```

## License

MIT