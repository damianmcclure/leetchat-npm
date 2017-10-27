# leetchat-npm
NPM Library for making bots for leetchat
## Usage
```js
var leetchat = require("./leetchat-lib.js");
var pref = "v-";

exports.userIsOnline = function(_user, _pass, _origin, _time, _timestamp) {
	
}

exports.receiveMsg = function(_user, _pass, _time, _msg) {
	console.log(_msg);
	if(_msg.startsWith(pref+"ping")){
		leetchat.sendMsg("Pong...");
	}
}

leetchat.setServer("server.com", "80", true, 4000, 6000);
leetchat.setUser("NiceBot", "PasswordforId", "general");

leetchat.listOnlineUsers();
leetchat.receiveMessages();
```
