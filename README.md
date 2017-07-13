# now-server

Create a proxy sever from a `rules.json` following specifications in https://zeit.co/docs/features/path-aliases. The server will behave identical
to `now alias [your-domain.com] -r rules.json`.

It will **not** manage your microservices, but this is easy to configure with [pm2](http://pm2.keymetrics.io/).

## Getting Started

```bash
npm install -g now-server pm2
```

Create a `rules.json` with

* [rules](https://zeit.co/docs/features/path-aliases)
* [apps](http://pm2.keymetrics.io/docs/usage/application-declaration/)

For example:

```json
{
  "apps" : [{
    "name"        : "now-server",
    "script"      : "node_modules/.bin/now-server",
    "args"        : "-r rules.json",
    "watch"       : ["rules.json"]
  },{
    "name"        : "service1",
    "script"      : "service1/index.js",
    "watch"       : ["service1"],
    "env": {
        "PORT":3001
    }
  },{
    "name"        : "service2",
    "script"      : "service2/index.js",
    "watch"       : ["service2"],
    "env": {
        "PORT":3002
    }
  }],
  "rules": [
    {
      "dest": "http://localhost:3001",
      "pathname": "/service1"
    },
    {
      "dest": "http://localhost:3002",
      "pathname": "/service2"
    }
  ]
}
```

The `apps` part follows the pm2 [application declaration](http://pm2.keymetrics.io/docs/usage/application-declaration/).

## Usage
```bash
# proxy server only
now-server -r rules.json -p 3000

# proxy server with microservices
pm2 start rules.json

pm2 ls    # status
pm2 kill  # kill it
```

## Changelog

0.4.0

- bugfix broken path forwarding

0.3.0

- Add not found handling
- Don't prepend path of destination (now does not do that either!)

0.2.1 - bugfix to make script run with node
