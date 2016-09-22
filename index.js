"use strict";
let http = require('http');
let fs = require('fs');
let request = require('request');
let argv = require('yargs').argv;
let logStream = argv.logfile ? fs.createWriteStream(argv.logfile):process.stdout;
let localhost = '127.0.0.1';
let scheme = 'http://';
let host = argv.host || localhost;
let port = argv.port || (host === localhost?8000:80);
let destinationUrl = scheme+host+':'+port;

let echoServer = http.createServer((req,res) => {
  logStream.write('\nechoServer\n');
  for(let header in req.headers){
    res.setHeader(header,req.headers[header]);
  }
  logStream.write(JSON.stringify(req.headers));
  req.pipe(res);
});
echoServer.listen(8000);
logStream.write('echoserver listening @127.0.0.1:8000');

let proxyServer = http.createServer((req,res) => {
  logStream.write('\nproxyServer\n');
  logStream.write(JSON.stringify(req.headers));
  let url = destinationUrl;
  if(req.headers['x-destination-url']){
    url = 'http://'+req.headers['x-destination-url'];
  }

  let options = {
    url: url + req.url
  }
  req.pipe(request(options)).pipe(res);
});
proxyServer.listen(9000);
logStream.write('proxyserver listening @127.0.0.1:9000');