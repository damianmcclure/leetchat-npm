# leetchat-npm
NPM Library for making bots for leetchat
## Usage (client.js)
```js
var leetchat = require("leetchat");

exports.userIsOnline = function(_user, _pass, _origin, _time, _timestamp, _channel, _server) {
     //this function is called when user is online/connected
     //user can use this function to write automated responses, bots and stuff like that...
     //if bot has moderator permissions _origin will have an IP address otherwise it's empty
}

exports.receiveMsg = function(_user, _pass, _time, _msg, _channel, _server) {
     //this function is called when new message is received
     //user can use this function to write automated responses, bots and stuff like that...
     if (_msg == ":ping") { sendMsg('pong'); }
}

//server, port, ssl_support, ...
leetchat.setServer("vps.unrealsecurity.net", "80", false, 4000, 6000);
//username, password, channel, ...
leetchat.setUser("NewBot", "p4sSw0rd", "general");

//ready to join...
leetchat.listOnlineUsers();
leetchat.receiveMessages();
```
## Information
You cannot install this under -g or globally.
Make sure the example JavaScript code is in file called client.js and in same directory with leetchat.js
## License
Do What The Fuck You Want Public License
https://spdx.org/licenses/WTFPL.html
