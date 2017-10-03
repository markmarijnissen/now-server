#!/usr/bin/env node
const http = require('http'),
      httpProxy = require('http-proxy'),
      minimatch = require('minimatch'),
      program = require('commander'),
      package = require('./package.json'),
      path = require('path');

program
  .version(package.version)
  .description("A development server for `now alias <domain> -r <rules.json>`\n"+
              "  See: https://zeit.co/docs/features/path-aliases")
  .option('-r, --rules [rules.json]','rules.json')
  .option('-p, --port [port]','port number (default: 3000)')
  .option('-l, --log','log requests')
  .parse(process.argv);

if (!program.rules) {
  program.help();
  return
}

const port = program.port || process.env.PORT || 3000;
const filename = path.resolve(process.cwd(),program.rules || process.env.RULES || 'rules.json');
const rules = require(filename).rules.map(rule => ({
  regex: rule.pathname ? minimatch.makeRe(rule.pathname) : /.*/,
  target: rule.dest
}));

const proxy = httpProxy.createProxy({
  changeOrigin: true,
  target: {
      https: true
  }
});

http.createServer((req, res) => {
  let target;
  for(let i = 0; !target && i < rules.length; i++) {
    if(rules[i].regex.test(req.url)) target = rules[i].target;
  }
  if(program.log) {
    console.log(`${req.method} ${req.url} > ${target ? target + req.url : 'Not found'}`);
  }
  if(target) {
    return proxy.web(req, res, {
      target: target
    });
  }
  res.statusCode = 404;
  return res.end("Not found");
}).listen(port,err => {
  if(err) {
    console.log("now-server failed to start:",err);
  } else {
    console.log("now-server started at http://localhost:"+port);
  }
});
