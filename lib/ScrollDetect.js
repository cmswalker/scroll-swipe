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

function ScrollDetect(opts) {
  var optCopy = Object.keys(opts).forEach(key => {    
    if (acceptedParams[key]) {      
      this[key] = opts[key];
      return;
    }

    throw new Error(`unknown options for ScrollDetect: ${key}`)
  });

  if (!opts.target) {
    throw new Error('must provide DOM target element to ScrollDetect');
  }

  this.scrollSensitivity = this.scrollSensitivity || 0;
  this.touchSensitivity = this.touchSensitivity || 0;

  this.latestTouch = null;
  this.latestDirection = VERTICAL;
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

ScrollDetect.prototype.initScroll = function initScroll() {
  this.target.addEventListener('wheel', e => {
      if (this.scrollPending) {
        return;
      }

      var x = e.deltaX;
      var y = e.deltaY;    

      this.addXScroll(x);
      this.addYScroll(y);

      this.scrollFulfilled((fulfilled, direction) => {
        if (!fulfilled) {
          return;
        }

        this.scrollCb(this.scrollPending, direction);   
      });
  });
}

ScrollDetect.prototype.initTouch = function initTouch() {
  this.target.addEventListener('touchmove', e => {
    var changedTouches = e.changedTouches[0];
    var x = changedTouches.clientX;
    var y = changedTouches.clientY;

    this.addXTouch(x);
    this.addYTouch(y);
  });

  this.target.addEventListener('touchend', e => {
    this.touchFulfilled(e, (fulfilled, direction) => {
      if (!fulfilled) {
        return;
      }

      this.touchCb(this.scrollPending, direction);      
    });
  });
}

//touch events
ScrollDetect.prototype.touchFulfilled = function touchFulfilled(e, cb) {
  if (!e) {
    throw new Error('must provide event to touchFulfilled');
  }

  if (!cb) {
    throw new Error('must provide callback to touchFulfilled');
  }

  var { touchSensitivity, touchArrX, touchArrY } = this;

  var bool = (touchArrX.length > touchSensitivity && touchArrY.length > touchSensitivity);  

  if (!bool) {
    return cb(false, null)
  }

  var changedTouches = e.changedTouches[0];

  var xStart = touchArrX[0];
  var yStart = touchArrY[0];

  var xEnd = changedTouches.clientX;
  var yEnd = changedTouches.clientY;

  var direction = VERTICAL;

  //determine vertical or horizontal based on the greatest difference
  if ( Math.abs(xStart - xEnd) > Math.abs(yStart - yEnd) ) {
    direction = HORIZONTAL;
  }    

  this.latestDirection = direction;
  this.resetTouches();
  this.scrollPending = true;

  cb(this.scrollPending, this.latestDirection);  
}

ScrollDetect.prototype.getTouch = function getTouch(idx) {
  return this.touchArr[idx];
}

ScrollDetect.prototype.addXTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrX.push(touch);
}

ScrollDetect.prototype.addYTouch = function addTouch(touch) {
  this.latestTouch = touch;  
  this.touchArrY.push(touch);
}

ScrollDetect.prototype.resetTouches = function resetTouches() {
  this.touchArrX = [];
  this.touchArrY = [];
}

//wheel events
ScrollDetect.prototype.addXScroll = function addXScroll(s) {
  this.xArr.push(s);
}

ScrollDetect.prototype.addYScroll = function addYScroll(s) {
  this.yArr.push(s);
}

ScrollDetect.prototype.getDirection = function getDirection() {
  return this.latestDirection;
}

ScrollDetect.prototype.resetScroll = function resetScroll() {
  this.xArr = [];
  this.yArr = [];
}

ScrollDetect.prototype.scrollFulfilled = function scrollFulfilled(cb) {
  if (!cb) {
    throw new Error('must provide callback to scrollFulfilled');
  }

  var { xArr, yArr, scrollSensitivity } = this;
  var bool = (xArr.length > scrollSensitivity && yArr.length > scrollSensitivity);

  this.evalScrollDirection();

  if (bool) {
    this.resetScroll();
    this.scrollPending = true;
  }

  cb(this.scrollPending, this.latestDirection);
}

ScrollDetect.prototype.evalScrollDirection = function evalScrollDirection() {  
  var { x, y } = this.getSums(); 
  this.latestDirection = x > y ? HORIZONTAL : VERTICAL;
}

ScrollDetect.prototype.getSums = function getSums() {
  var { xArr, yArr } = this;

  var x = xArr.reduce((result, curr) => {
      return result += Math.abs(curr);
    }, 0);

  var y = yArr.reduce((result, curr) => {
      return result += Math.abs(curr);
    }, 0);  
  
  return {x, y};
}

ScrollDetect.prototype.getScrollDirection = function getScrollDirection() {
  return this.latestDirection;
}
