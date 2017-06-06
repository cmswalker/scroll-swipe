# scroll-swipe :mouse2:

#### [NPM](https://www.npmjs.com/package/scroll-swipe)
```
npm install scroll-swipe
```

### easy-peasy 2-step API for providing scroll and touch event direction handlers

##### UMD-wrapped for use with node/browser and with or without bundlers

#### Example setup can be found [here](https://github.com/cmswalker/scroll-swipe/blob/master/examples/index.js)

##### Run the example locally:
```
npm install
npm start => localhost:3333
```

### Instantiate
```
var ss = new ScrollSwipe({
	target: document, // Element must be a single dom-node per ScrollSwipe Instance
	scrollSensitivity: 0, // The lower the number, the more sensitive
	touchSensitivity: 0, // The lower the number, the more senitive
	scrollPreventDefault: true, // prevent default option for scroll events
	touchPreventDefault: true, // prevent default option for touch events
	scrollCb: scrollCb,  // The action you wish to perform when a scroll reacts (details below)
	touchCb: touchCb // The action you wish to perform when a touch reacts (details below)
});
```

### Scroll API && Touch API
```
//Example callbacks for the ScrollSwipe instance above ^^

/**
 * @param  {Object} data - returns the following
 * startEvent - Event that triggered this action
 * lastEvent - Last Event at the end of action
 * scrollPending - state of instance's scrollPending property (will always come back true after a successful event)
 * direction - 'VERTICAL' || 'HORIZONTAL' for mapping vertical/horizontal actions from the event;
 * intent - 0 || 1  for mapping up/down && left/right actions from the event
 */

function scrollCb(data) {
    //do animations, state changes/eval or something async, then open the listener back up.
	ss.listen();
}

function touchCb(data) {
    //the exact same behavior as scrollCb ^^ applies
    ss.listen();
}

// kill scroll event listeners for an instance with ss.killScroll();
// kill touch event listeners for an instance with ss.killTouch();
// kill all event listeners for an instance with ss.killAll();

```
