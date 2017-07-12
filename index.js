const http = require('http'),
      httpProxy = require('http-proxy'),
      HttpProxyRules = require('http-proxy-rules');
      minimatch = require('minimatch'),
      program = require('commander'),
      package = require('./package.json'),
      path = require('path');

program
  .version(package.version)
  .description("A development server for `now alias <domain> -r <rules.json>`\n"+
              "  See: https://zeit.co/docs/features/path-aliases")
  .option('-r, --rules [rules.json]','rules.json')
  .option('-p, --port','port number (default: 3000)')
  .parse(process.argv);

if (!program.rules) {
  program.help();
  return
}


const port = program.port || process.env.PORT || 3000;
const config = { rules: { } };
const rules = require(path.resolve(process.cwd(),program.rules || process.env.RULES || 'rules.json')).rules;
rules.forEach(rule => {
  if(!rule.pathname) {
    config.default = rule.dest;
  } else {
    config.rules[minimatch.makeRe(rule.pathname).source] = rule.dest;
  }
});

const proxyRules = new HttpProxyRules(config);
const proxy = httpProxy.createProxy({
  changeOrigin: true,
  target: {
      https: true
    }
});

http.createServer((req, res) => {
  return proxy.web(req, res, {
    target: proxyRules.match(req) || config.default
  });
}).listen(port,err => {
  if(err) {
    console.log("now-server failed to start:",err);
  } else {
    console.log("now-server started at http://localhost:"+port);
  }
});
