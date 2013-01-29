#!/usr/bin/env node
var dazeus = require("dazeus");

var client = dazeus.connect({path: '/tmp/dazeus.sock'}, function () {
    client.networks(function (result) {
        console.log("Available networks:");
        for (var i in result.networks) {
            if (result.networks.hasOwnProperty(i)) {
                console.log("- " + result.networks[i]);
            }
        }
        client.close(function () {});
    });

});
