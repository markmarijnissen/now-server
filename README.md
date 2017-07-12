# now-server

Creates a local development server for `now alias [domain] -r rules.json`.

This is only a proxy server, it will not spawn microservices for you. See (micro-cluster)[https://github.com/zeit/micro-cluster] if you want that.

## Installation

```bash
## global installation
npm install -g now-server

## local installation
npm install --save-dev now-server
```

For local installation, add a script in your `package.json`:
```json
{
  "scripts":{
    "start":"now-server -r rules.json -p 3000"
  }
}
```

Create a `rules.json` following specifications in https://zeit.co/docs/features/path-aliases, for example:

```json
{
  "rules": [
    {
      "dest": "http://localhost:3001",
      "pathname": "/users"
    },
    {
      "dest": "http://localhost:3002"
    }
  ]
}
```

## Usage
```bash
## global installation
npm install -g now-server
now-server -r rules.json -p 3000

## local installation
npm run start
```

## Running now-server with a bunch of microservices

Use PM2 to run your microservices.

```
npm install --save pm2
```

Change your startup script in `package.json`
```json
{
  "scripts":{
    "start":"pm2 start services.json",
    "pm2":"pm2",
  }
}
```

Create a `services.json` that describes your microservices:
```json
{
  "apps" : [{
    "name"        : "now-server",
    "script"      : "now-server",
    "args"        : "-r ./rules.json",
    "watch"       : true
  },{
    "name"        : "users",
    "script"      : "./users/your-user-server.js",
    "watch"       : true,
    "env": {
      "PORT":3001
    }
  },{
    "name"        : "app",
    "script"      : "./app/your-app-server.js",
    "watch"       : false,
    "env": {
      "PORT":3002
    }
  }]
}
```

Now you can start now-server with all microservices:
```bash
npm start
npm run pm2 -- ls
npm run pm2 -- kill
# etc
```
