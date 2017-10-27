var server = '';
var port = 80;
var ssl = false;
var appname = 'leetchat';
var channel = '';
var username = '';
var password = '';
var messageHistory = [];
(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.3.2";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = require('buffer').Buffer;
        } catch (err) {}
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ?
        buffer.from && buffer.from !== Uint8Array.from ? function (u) {
            return (u.constructor === buffer.constructor ? u : buffer.from(u))
                .toString('base64')
        }
        :  function (u) {
            return (u.constructor === buffer.constructor ? u : new  buffer(u))
                .toString('base64')
        }
        : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ?
        buffer.from && buffer.from !== Uint8Array.from ? function(a) {
            return (a.constructor === buffer.constructor
                    ? a : buffer.from(a, 'base64')).toString();
        }
        : function(a) {
            return (a.constructor === buffer.constructor
                    ? a : new buffer(a, 'base64')).toString();
        }
        : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {		
        // AMD. Register as an anonymous module.	
        define([], function(){ return global.Base64 });
    }
    // that's it!
})(   typeof self   !== 'undefined' ? self
    : typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : this
);
var http = require('http');
var chost = '/' + appname + '/' + appname + '.php';
var online_user_update_speed = 6000;
var messages_update_speed = 4000;
if (ssl == true) { http = require('https'); };
var def = require('./leetchat.js');

var aa = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m"
}

var fg = {
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m"
}

var bg = {
	black: "\x1b[40m",
	red: "\x1b[41m",
	green: "\x1b[42m",
	yellow: "\x1b[43m",
	blue: "\x1b[44m",
	magenta: "\x1b[45m",
	cyan: "\x1b[46m",
	white: "\x1b[47m"
}

var reset = true;

exports.setServer = function(_server, _port, _ssl, _interval1, _interval2){
    server = _server;
	port = _port;
	ssl = _ssl;
	online_user_update_speed = _interval1;
	messages_update_speed = _interval2;
};

exports.setUser = function(_user, _pass, _channel){
	username = _user;
	password = _pass;
	channel = _channel;
};

exports.printunsafe = function(str){
	str = str.split('&apos;').join("'");
	str = str.split('&quot;').join('"');
	str = str.split('&lt;').join('<');
	str = str.split('&gt;').join('>');
	return str;
}

exports.receiveMessages = function(){
	var params = 'username=' + encodeURIComponent(Base64.encode(username)) + '&password=' + encodeURIComponent(Base64.encode(password)) + '&channel=' + encodeURIComponent(Base64.encode(channel)) + '&req=_' + Math.floor(Math.random() * (999999 - 100 + 1)) + 100;
	var options = {
		host: server,
		method: 'POST',
		port: port,
		path: chost,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': params.length
		}
	};
	var req = http.request(options, function(res) {
		req.timeout = 5000;
		res.setEncoding('utf8');
		res.on('data', function (response) {
			if (response.length > 0) {
				if (response == 'ERR_IP_BANNED') {
					console.log('Your IP address is banned!');
				} else {
					var messages = response.split("\n");
					for (i = 0; i < messages.length; i++) {
						var parts = messages[i].split(' ');
						if (parts.length > 1) {
							var i2 = Base64.decode(parts[0]);
							if (messageHistory.indexOf(i2) <= -1) {
								if (reset == false) {
									var _user = Base64.decode(parts[1]);
									var _pass = Base64.decode(parts[2]);
									var _msg = Base64.decode(parts[3]);
									var now = new Date(); 
									var _timestamp = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate();
									_timestamp += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds();
									//console.log({_user, _pass, _msg, _timestamp});
									console.log('USER: ' + (aa.bright + fg.magenta + _user + aa.reset) + ' PASS: ' + (aa.bright + fg.magenta + _pass + aa.reset) + ' MSG: ' + (aa.bright + fg.magenta + _msg + aa.reset) + ' TIMESTAMP: ' + (aa.bright + fg.magenta + _timestamp + aa.reset));
									def.receiveMsg(_user, _pass, _timestamp, _msg);
								}
								messageHistory.push(i2);
							}
						}
					}
					if (reset == true) { reset = false; }
				}
			}
			setTimeout(exports.receiveMessages, messages_update_speed);
		});
	});
	req.write(params);
	req.end();
};

exports.listOnlineUsers = function(){
	var params = 'username=' + encodeURIComponent(Base64.encode(username)) + '&password=' + encodeURIComponent(Base64.encode(password)) + '&channel=' + encodeURIComponent(Base64.encode(channel)) + '&onlineusers=1' + '&req=_' + Math.floor(Math.random() * (999999 - 100 + 1)) + 100;
	var options = {
		host: server,
		method: 'POST',
		port: port,
		path: chost,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': params.length
		}
	};
	var req = http.request(options, function(res) {
		req.timeout = 5000;
		res.setEncoding('utf8');
		res.on('data', function (response) {
			if (response.length > 0) {
				var users = response.split("\n");
				for (i = 0; i < users.length; i++) {
					var parts = users[i].split(' ');
					if (parts.length > 1) {
						var _user = Base64.decode(parts[0]);
						var _pass = Base64.decode(parts[1]);
						var _time = Base64.decode(parts[2]);
						var _origin = '';
						if (parts.length > 3) {
							_origin = Base64.decode(parts[3]);
						}
						var now = new Date(); 
						var _timestamp = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate();
						_timestamp += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds();
						if (parts.length > 3) {
							//console.log({_user, _pass, _origin, _time, _timestamp});
							console.log('USER: ' + (aa.bright + fg.cyan + _user + aa.reset) + ' ORIGIN: ' + (aa.bright + fg.cyan + _origin + aa.reset) + ' PASS: ' + (aa.bright + fg.cyan + _pass + aa.reset) + ' TIME: ' + (aa.bright + fg.cyan + _time + aa.reset) + ' TIMESTAMP: ' + (aa.bright + fg.cyan + _timestamp + aa.reset));
							def.userIsOnline(_user, _pass, _origin, _time, _timestamp);
						} else {
							//console.log({_user, _pass, _time, _timestamp});
							console.log('USER: ' + (aa.bright + fg.cyan + _user + aa.reset) + ' PASS: ' + (aa.bright + fg.cyan + _pass + aa.reset) + ' TIME: ' + (aa.bright + fg.cyan + _time + aa.reset) + ' TIMESTAMP: ' + (aa.bright + fg.cyan + _timestamp + aa.reset));
							def.userIsOnline(_user, _pass, '', _time, _timestamp);
						}
					}
				}
			}
			setTimeout(exports.listOnlineUsers, online_user_update_speed);
		});
	});
	req.write(params);
	req.end();
};

exports.sendMsg = function(msg){
	console.log('SEND MSG: ' + (aa.bright + fg.green + msg + aa.reset));
	var params = 'username=' + encodeURIComponent(Base64.encode(username)) + '&password=' + encodeURIComponent(Base64.encode(password)) + '&message=' + encodeURIComponent(Base64.encode(msg)) + '&channel=' + encodeURIComponent(Base64.encode(channel)) + '&req=_' + Math.floor(Math.random() * (999999 - 100 + 1)) + 100;
	var options = {
		host: server,
		method: 'POST',
		port: port,
		path: chost,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': params.length
		}
	};
	var req = http.request(options, function(res) {
		req.timeout = 5000;
		res.setEncoding('utf8');
		res.on('data', function (response) {
			if (response.length > 0) {
				if (response == 'ERR_IP_BANNED') {
					console.log('Your IP address is banned!');
				}
			}
		});
	});
	req.write(params);
	req.end();
};

exports.banIP = function(ip){
	var params = 'username=' + encodeURIComponent(Base64.encode(username)) + '&password=' + encodeURIComponent(Base64.encode(password)) + '&channel=' + encodeURIComponent(Base64.encode(channel)) + '&ban=' + ip;
	var options = {
		host: server,
		method: 'POST',
		port: port,
		path: chost,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': params.length
		}
	};
	var req = http.request(options, function(res) {
		req.timeout = 5000;
		res.setEncoding('utf8');
		res.on('data', function (response) {
			
		});
	});
	req.write(params);
	req.end();
};


