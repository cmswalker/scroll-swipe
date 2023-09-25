const ScrollSwipe = require('../lib/ScrollSwipe'); //or just use the global window.ScrollDirect if using this on the client;

function initializeExample() {

	function ssFactory() {
		return new ScrollSwipe({
			target: document.body, // can be a div, or anything else you want to track scroll/touch events on
			scrollSensitivity: 4, // the lower the number, the more sensitive
			touchSensitivity: 4, // the lower the number, the more sensitive,
			scrollPreventDefault: true, // prevent default option for scroll events, manually handle scrolls with scrollCb
			touchPreventDefault: true, // prevent default option for touch events, manually handle scrolls with touchCb
			scrollCb,
			touchCb,

			// native options to pass to listener: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters
			addEventListenerOptions: {passive: false}
		});
	}

	let ss = ssFactory();

	function scrollCb(data, ss) {
		const { direction, mappedIntent } = data;
		console.log('scroll data', data);
		console.log(`the user scrolled ${direction} with an intent of ${mappedIntent}`);

		//perform actions such as animations/transitions or just plain function calls, then set the scrollPending back to false to listen for the next event
		ss.listen();
	}

	function touchCb(data, ss) {
		const { direction, mappedIntent } = data;
		console.log('touch data', data);
		console.log(`the user scrolled ${direction} with an intent of ${mappedIntent}`);

		//perform actions such as animations/transitions or just plain function calls, then set the scrollPending back to false to listen for the next event
		ss.listen();
	}

	const killBtn = document.getElementById('kill');
	const restartBtn = document.getElementById('restart');
	restartBtn.style.display = 'none';

	killBtn.addEventListener('click', function() {
		//remove all event listeners
		ss.killAll();

		killBtn.style.display = 'none';
		restartBtn.style.display = 'inline-block';
	});

	restartBtn.addEventListener('click', function() {
		restartBtn.style.display = 'none';
		killBtn.style.display = 'inline-block';

		ss = ssFactory(); // re-init after killing listeners
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
