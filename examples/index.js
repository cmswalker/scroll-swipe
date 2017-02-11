var ScrollDetect = require('../dist/ScrollDetect'); //or just use the global window.ScrollDirect if using this on the client;

var sd = new ScrollDetect({
	target: document,
	scrollSensitivity: 0, // the lower the number, the more sensitive
	touchSensitivity: 0, // the lower the number, the more senitive
	scrollCb: scrollCb,
	touchCb: touchCb	
});

function scrollCb(scrollPending, direction) {
	console.log('scrollPending = ', scrollPending);
	console.log('trigged scroll to direction: ', direction);
	console.log('based on a senstivity level of ', sd.scrollSensitivity);

	//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
	sd.scrollPending = false;
}

function touchCb(scrollPending, direction) {
	console.log('scrollPending = ', scrollPending);
	console.log('trigged touch to direction: ', direction);
	console.log('based on a senstivity level of ', sd.touchSensitivity);

	//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
	sd.scrollPending = false;
}
