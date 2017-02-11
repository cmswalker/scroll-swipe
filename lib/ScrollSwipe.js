const VERTICAL = 'VERTICAL';
const HORIZONTAL = 'HORIZONTAL';

const noOp = () => {};

var acceptedParams = {
  target: true,
  scrollSensitivity: true,
  touchSensitivity: true,
  scrollCb: true,
  touchCb: true
};

if (typeof module !== 'undefined') {
  module.exports = ScrollSwipe;
}

function ScrollSwipe(opts) {
  var optCopy = Object.keys(opts).forEach(key => {    
    if (acceptedParams[key]) {      
      this[key] = opts[key];
      return;
    }

    throw new Error(`unknown options for ScrollSwipe: ${key}`)
  });

  if (!opts.target) {
    throw new Error('must provide DOM target element to ScrollSwipe');
  }

  this.scrollSensitivity = this.scrollSensitivity || 0;
  this.touchSensitivity = this.touchSensitivity || 0;

  this.latestTouch = null;
  this.latestScroll = null;
  this.intent = 0;
  this.currentDirection = VERTICAL;
  this.touchArr = [];  
  this.xArr = [];
  this.yArr = [];
  this.touchArrX = [];
  this.touchArrY = [];

  this.scrollPending = false;

  //these should only init if true
  if (this.scrollCb) {
    this.initScroll();
  }

  if (this.touchCb) {
    this.initTouch();
  }  
}

ScrollSwipe.prototype.listen = function listen() {
  this.scrollPending = false;
}

ScrollSwipe.prototype.initScroll = function initScroll() {
  this.target.addEventListener('wheel', e => {
      if (this.scrollPending) {
        return;
      }

      var x = e.deltaX;
      var y = e.deltaY;    

      this.addXScroll(x);
      this.addYScroll(y);

      this.scrollFulfilled((fulfilled, direction, intent) => {
        if (!fulfilled) {
          return;
        }

        this.scrollCb(this.scrollPending, direction, intent);   
      });
  });
}

ScrollSwipe.prototype.initTouch = function initTouch() {
  this.target.addEventListener('touchmove', e => {
    var changedTouches = e.changedTouches[0];
    var x = changedTouches.clientX;
    var y = changedTouches.clientY;

    this.addXTouch(x);
    this.addYTouch(y);
  });

  this.target.addEventListener('touchend', e => {
    this.touchFulfilled(e, (fulfilled, direction, intent) => {
      if (!fulfilled) {
        return;
      }

      this.touchCb(this.scrollPending, direction, intent);      
    });
  });
}

//touch events
ScrollSwipe.prototype.touchFulfilled = function touchFulfilled(e, cb) {
  if (!e) {
    throw new Error('must provide event to touchFulfilled');
  }

  if (!cb) {
    throw new Error('must provide callback to touchFulfilled');
  }

  var { touchSensitivity, touchArrX, touchArrY } = this;

  var bool = (touchArrX.length > touchSensitivity && touchArrY.length > touchSensitivity);  

  if (!bool) {
    return cb(false, null);
  }

  var changedTouches = e.changedTouches[0];

  var xStart = touchArrX[0];
  var yStart = touchArrY[0];

  var xEnd = changedTouches.clientX;
  var yEnd = changedTouches.clientY;

  var xIntent = xStart < xEnd ? 1 : 0;
  var yIntent = yStart < yEnd ? 1 : 0;

  var direction = VERTICAL;

  //determine vertical or horizontal based on the greatest difference
  if ( Math.abs(xStart - xEnd) > Math.abs(yStart - yEnd) ) {
    direction = HORIZONTAL;
  }

  const intent = direction === VERTICAL ? yIntent : xIntent;

  swap.call(this, intent, direction);
  this.resetTouches();
  this.scrollPending = true;

  cb(this.scrollPending, this.currentDirection, this.currentIntent);  
}

ScrollSwipe.prototype.getTouch = function getTouch(idx) {
  return this.touchArr[idx];
}

ScrollSwipe.prototype.addXTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrX.push(touch);
}

ScrollSwipe.prototype.addYTouch = function addTouch(touch) {
  this.latestTouch = touch;  
  this.touchArrY.push(touch);
}

ScrollSwipe.prototype.resetTouches = function resetTouches() {
  this.touchArrX = [];
  this.touchArrY = [];
}

//wheel events
ScrollSwipe.prototype.addXScroll = function addXScroll(s) {  
  this.latestScroll = s;
  this.xArr.push(s);
}

ScrollSwipe.prototype.addYScroll = function addYScroll(s) {
  this.latestScroll = s;
  this.yArr.push(s);
}

ScrollSwipe.prototype.getDirection = function getDirection() {
  return this.currentDirection;
}

ScrollSwipe.prototype.resetScroll = function resetScroll() {
  this.xArr = [];
  this.yArr = [];
}

ScrollSwipe.prototype.scrollFulfilled = function scrollFulfilled(cb) {
  if (!cb) {
    throw new Error('must provide callback to scrollFulfilled');
  }

  var { xArr, yArr, scrollSensitivity } = this;

  const bool = (xArr.length > scrollSensitivity && yArr.length > scrollSensitivity);
  const { direction, intent } = this.evalScrollDirection();  

  if (bool) {    
    swap.call(this, intent, direction);
    this.resetScroll();
    this.scrollPending = true;
  }

  cb(this.scrollPending, this.currentDirection, this.currentIntent);
}

ScrollSwipe.prototype.evalScrollDirection = function evalScrollDirection() {  
  const { x, y, xIntent, yIntent } = this.getSums();
  const direction = x > y ? HORIZONTAL : VERTICAL;
  const base = direction === VERTICAL ? yIntent : xIntent;

  var intent = 0;

  if (base > 0) {
    intent = 1;
  }
  
  return { direction, intent };
}

ScrollSwipe.prototype.getSums = function getSums() {
  const { xArr, yArr } = this;

  var xIntent = 0;
  var yIntent = 0;

  var x = xArr.reduce((result, curr) => {
      xIntent = xIntent + curr;
      return result += Math.abs(curr);
    }, 0);

  var y = yArr.reduce((result, curr) => {      
      yIntent = yIntent + curr;
      return result += Math.abs(curr);
    }, 0);  
  
  return {x, y, xIntent, yIntent};
}

ScrollSwipe.prototype.getScrollDirection = function getScrollDirection() {
  return this.currentDirection;
}

function swap(intent, direction) {
  this.previousIntent = this.currentIntent;
  this.currentIntent = intent;
  this.previousDirection = this.currentDirection;
  this.currentDirection = direction;
}