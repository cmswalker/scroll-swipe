const ScrollSwipe = require('../lib/ScrollSwipe'); //or just use the global window.ScrollDirect if using this on the client;

function initializeExample() {
	const ss = new ScrollSwipe({
		target: document.body, // can be a div, or anything else you want to track scroll/touch events on
		scrollSensitivity: 0, // the lower the number, the more sensitive
		touchSensitivity: 0, // the lower the number, the more senitive,
		scrollPreventDefault: true, // prevent default option for scroll events, manually handle scrolls with scrollCb
		touchPreventDefault: true, // prevent default option for touch events, manually handle scrolls with touchCb
		scrollCb,
		touchCb
	});

	function scrollCb(data) {
		const { direction, mappedIntent } = data;
		console.log('scroll data', data);
		console.log('the user scrolled ', direction);
		console.log('with an intent of ', mappedIntent);

		//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
		ss.listen();
	}

	function touchCb(data) {
		console.log('touch data', data);
		const { direction, mappedIntent } = data;
		console.log('the user scrolled ', direction);
		console.log('with an intent of ', mappedIntent);

		//perform actions such as animations/transitions or just plain funciton calls, then set the scrollPending back to false to listen for the next event
		ss.listen();
	}

	const k = document.getElementById('kill');
	k.addEventListener('click', function(e) {
		//remove all event listeners
		ss.killAll();
	});
}

//////////////////// DEMO SETUP ///////////////////////////

function initializeExamplePage() {
	document.body.height = 1000000;

	for (let i = 0; i < 100; i++) {
		const div = document.createElement('div');
		div.style.height = '300px';
		div.style.width = '100%';
		div.style.backgroundColor = getRandomColor();
		document.body.appendChild(div);
	}
}

initializeExamplePage();
initializeExample();

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}