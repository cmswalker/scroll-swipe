var ScrollSwipe = require('../lib/ScrollSwipe'); //or just use the global window.ScrollDirect if using this on the client;

var sd = new ScrollSwipe({
	target: document, // can be a div, or anything else you want to track scroll/touch events on
	scrollSensitivity: 0, // the lower the number, the more sensitive
	touchSensitivity: 0, // the lower the number, the more senitive
	scrollCb: scrollCb,
	touchCb: touchCb	
});

var intentMap = {
	'VERTICAL': {
		0: 'UP',
		1: 'DOWN'
	},
	'HORIZONTAL': {
		0: 'LEFT',
		1: 'RIGHT'
	}
};

function scrollCb(scrollPending, direction, intent) {	
	console.log('trigged scroll to direction: ', direction);
	console.log('with an intent of going: ', intentMap[direction][intent]);
	console.log('based on a senstivity level of ', sd.scrollSensitivity);

	//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
	sd.listen();
}

function touchCb(scrollPending, direction, intent) {	
	console.log('trigged touch to direction: ', direction);
	console.log('with an intent of going: ', intentMap[direction][intent]);
	console.log('based on a senstivity level of ', sd.touchSensitivity);

	//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
	sd.listen();
}
