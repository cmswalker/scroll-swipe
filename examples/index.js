var ScrollSwipe = require('../lib/ScrollSwipe'); //or just use the global window.ScrollDirect if using this on the client;

var ss = new ScrollSwipe({
	target: document.body, // can be a div, or anything else you want to track scroll/touch events on
	scrollSensitivity: 0, // the lower the number, the more sensitive
	touchSensitivity: 0, // the lower the number, the more senitive,
	scrollPreventDefault: true, // prevent default option for scroll events
	touchPreventDefault: true, // prevent default option for touch events
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

/**
 * @param  {Object} data - returns the following
 * startEvent - Event that triggered this action
 * lastEvent - Last Event at the end of action
 * scrollPending - state of instance's scrollPending property (will always come back true after a successful event)
 * direction - 'VERTICAL' || 'HORIZONTAL' for mapping vertical/horizontal actions from the event;
 * intent - 0 || 1  for mapping up/down && left/right actions from the event
 */
function scrollCb(data) {
	console.log('scroll data', data);
	console.log('the user scrolled ', data.direction);
	console.log('with an intent of ', intentMap[data.direction][data.intent]);

	//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
	ss.listen();
}

function touchCb(data) {
	console.log('touch data', data);

	//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
	ss.listen();
}

var k = document.getElementById('kill');
k.addEventListener('click', function(e) {
	killAll();
});

function killAll() {
	//remove all event listeners
	ss.killAll();
}
