require('js-methods');
var dazeus = require("dazeus");
var spawn = require('child_process').spawn;
var fs = require('fs');

var USERUNITS = 'user.units';
var GUNITS = 'gunits';

/** Create a new client */
var client = dazeus.connect({path: '/tmp/dazeus.sock'}, function () {
    client.onCommand('convert', function (network, user, channel, command, conversion) {
        var parts = conversion.split(' to ');
        if (parts.length == 2) {
            var from = parts.shift().trim();
            var to = parts.shift().trim();

            var gunits = spawn(GUNITS, ['-t', '-o', '%.3g', '-f', '', '-f', USERUNITS, from, to]);
            gunits.stdout.on('data', function (data) {
                var out = data.toString().trim();

                if (out.length > 0) {
                    if (out.indexOf("Unknown unit") === 0) {
                        client.reply(network, channel, user, out);
                    } else {
                        client.reply(network, channel, user, out + " " + to, false);
                    }
                }
            });
        } else {
            client.reply(network, channel, user, "To convert, use }convert [from] to [to]; to learn new units use }unit [unit] is [definition]");
        }
    });

    client.onCommand('unit', function (network, user, channel, command, unit) {
        var parts = unit.split(' is ');

        if (parts.length >= 1) {
            var name = parts.shift().trim();
            var prefix = false;

            if (name[name.length - 1] === '-') {
                prefix = true;
            }

            if (parts.length == 2) {
                if (!/^[a-z-]+$/.test(name)) {
                    client.reply(network, channel, user, "I'm sorry, but I only accept lowercase alphabetic unit names");
                } else {
                    var value = parts.shift().trim();
                    get_errors(function (before) {
                        is_defined(prefix ? name.substr(0, name.length - 1) : name, function (defined, as_what) {
                            is_base_unit(prefix ? name.substr(0, name.length - 1) : name, function (base) {
                                if (!defined) {
                                    append(name, value, function () {
                                        get_errors(function (after) {
                                            if (after <= before) {
                                                client.reply(network, channel, user, "Ok, " + name + " is now " + value);
                                            } else {
                                                remove(name, function () {
                                                    client.reply(network, channel, user, "I can't use that definition");
                                                });
                                            }
                                        });
                                    });
                                } else if (defined && !base) {
                                    client.reply(network, channel, user, name + " is already defined as " + as_what + ". Use }nounit " + name + " to forget");
                                } else {
                                    client.reply(network, channel, user, name + " is already defined as " + as_what);
                                }
                            });
                        });
                    });
                }
            } else {
                is_defined(prefix ? name.substr(0, name.length - 1) : name, function (defined, as_what) {
                    if (defined) {
                        client.reply(network, channel, user, name + " is " + as_what);
                    } else {
                        client.reply(network, channel, user, name + " is not defined");
                    }
                });
            }
        } else {
            client.reply(network, channel, user, "To convert, use }convert [from] to [to]; to learn new units use }unit [unit] is [definition]");
        }
    });

    client.onCommand('nounit', function (network, user, channel, command, toremove) {
        var name = toremove.trim();
        if (!/^[a-z-]+$/.test(name)) {
            client.reply(network, channel, user, "I'm sorry, but I only accept lowercase alphabetic unit names");
        } else {
            is_defined(name, function (defined) {
                is_base_unit(name, function (base) {
                    if (defined && !base) {
                        remove(name, function () {
                            client.reply(network, channel, user, "Removed unit " + name);
                        });
                    } else if (!defined) {
                        client.reply(network, channel, user, "Unit " + name + " doesn't exist");
                    } else if (base) {
                        client.reply(network, channel, user, "Ha! You're funny!");
                    }
                });
            });
        }
    });
});

var get_errors = function (cb) {
    var gunits = spawn(GUNITS, ['-c', '-t', '-f', '', '-f', USERUNITS]);
    var lines = 0;
    gunits.stdout.on('data', function (data) {
        var out = data.toString().trim();
        if (out.length > 0) {
            lines += 1;
        }
    });

    gunits.on('exit', function () {
        cb(lines);
    });
};

var is_base_unit = function (unit, cb) {
    var gunits = spawn(GUNITS, ['-t', '-f', '', unit]);

    gunits.stdout.on('data', function (data) {
        var out = data.toString().trim();
        if (out.length > 0) {
            cb(out.indexOf('Unknown unit') !== 0);
        }
    });
};

var is_defined = function (unit, cb) {
    var gunits = spawn(GUNITS, ['-t', '-f', '', '-f', USERUNITS, unit]);

    gunits.stdout.on('data', function (data) {
        var out = data.toString().trim();
        if (out.length > 0) {
            cb(out.indexOf('Unknown unit') !== 0, out);
        }
    });
};

var remove = function (unit, cb) {
    readfile(function (elems) {
        for (var i in elems) {
            if (elems.hasOwnProperty(i)) {
                if (elems[i].indexOf(unit + ' ') === 0) {
                    delete elems[i];
                }
            }
        }
        writefile(elems, function () {
            cb();
        });
    });
};

var append = function (unit, definition, cb) {
    fs.appendFile(USERUNITS, unit + " " + definition + "\n", function (err) {
        cb();
    });
};

var readfile = function (cb) {
    fs.readFile(USERUNITS, function(err, data) {
        if(err) throw err;
        var array = data.toString().split("\n");
        cb(array);
    });
};

var writefile = function (data, cb) {
    var stream = fs.createWriteStream(USERUNITS, {flags: 'w'});
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            if (typeof data[i] === 'string') {
                stream.write(data[i] + "\n");
            }
        }
    }
    stream.end();
    cb();
};

