#scroll-detect :mouse2:

####[View on NPM](https://www.npmjs.com/package/fullpage-react)
```
npm install scroll-detect
```

###easy-peasy 2-step API for providing scroll and touch event direction handlers
#####UMD-wrapped for use with node/browser and with or without bundlers

####Example setup can be found [here](https://github.com/cmswalker/scroll-detect/blob/master/examples/index.js)

#####Run the example locally:
```
npm install
npm start => localhost:3333
```

###Instantiate
```
var sd = new ScrollDetect({
	target: document, // Element must be a single dom-node per ScrollDetect Instance
	scrollSensitivity: 0, // The lower the number, the more sensitive
	touchSensitivity: 0, // The lower the number, the more senitive
	scrollCb: scrollCb,  // The action you wish to perform when a scroll reacts (details below)
	touchCb: touchCb // The action you wish to perform when a touch reacts (details below)
});
```

###Scroll API && Touch API
```
// The callbacks for the ScrollDetect instance above ^^

function scrollCb(scrollPending, direction) {
	// scrollPending will always be true at this point, it is included in the callback arguments to help remind you to set it back to false when performing actions such as async, animations/transitions or just plain function calls;
	
	// direction will either be 'VERTICAL' or 'HORIZONTAL' depending on the user-interaction
	
	//do animations, state changes/eval or something async, then open the listener back up.
	sd.scrollPending = false;
}

funciton touchCb(scrollPending, direction) {
  //the exact same behavior as scrollCb ^^ applies
}

```
