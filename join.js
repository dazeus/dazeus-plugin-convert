#!/usr/bin/env node
var dazeus = require("dazeus");
var argv = require('optimist')
    .usage('Usage: $0 -n [network] -c [channel]')
    .demand(['n','c'])
    .argv;

var client = dazeus.connect({path: '/tmp/dazeus.sock'}, function () {
    client.join(n, c);
    client.close(function () {
        console.log("Aaaand... we're done!");
    });
});
