;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.ScrollSwipe = factory();
  }
}(this, function() {
'use strict';

var VERTICAL = 'VERTICAL';
var HORIZONTAL = 'HORIZONTAL';

var noOp = function noOp() {};

var acceptedParams = {
  target: true,
  scrollSensitivity: true,
  touchSensitivity: true,
  scrollCb: true,
  touchCb: true
};

function ScrollSwipe(opts) {
  var _this = this;

  var optCopy = Object.keys(opts).forEach(function (key) {
    if (acceptedParams[key]) {
      _this[key] = opts[key];
      return;
    }

    throw new Error('unknown options for ScrollSwipe: ' + key);
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
};

ScrollSwipe.prototype.initScroll = function initScroll() {
  var _this2 = this;

  this.target.addEventListener('wheel', function (e) {
    if (_this2.scrollPending) {
      return;
    }

    var x = e.deltaX;
    var y = e.deltaY;

    _this2.addXScroll(x);
    _this2.addYScroll(y);

    _this2.scrollFulfilled(function (fulfilled, direction, intent) {
      if (!fulfilled) {
        return;
      }

      _this2.scrollCb(_this2.scrollPending, direction, intent);
    });
  });
};

ScrollSwipe.prototype.initTouch = function initTouch() {
  var _this3 = this;

  this.target.addEventListener('touchmove', function (e) {
    var changedTouches = e.changedTouches[0];
    var x = changedTouches.clientX;
    var y = changedTouches.clientY;

    _this3.addXTouch(x);
    _this3.addYTouch(y);
  });

  this.target.addEventListener('touchend', function (e) {
    _this3.touchFulfilled(e, function (fulfilled, direction, intent) {
      if (!fulfilled) {
        return;
      }

      _this3.touchCb(_this3.scrollPending, direction, intent);
    });
  });
};

//touch events
ScrollSwipe.prototype.touchFulfilled = function touchFulfilled(e, cb) {
  if (!e) {
    throw new Error('must provide event to touchFulfilled');
  }

  if (!cb) {
    throw new Error('must provide callback to touchFulfilled');
  }

  var touchSensitivity = this.touchSensitivity;
  var touchArrX = this.touchArrX;
  var touchArrY = this.touchArrY;


  var bool = touchArrX.length > touchSensitivity && touchArrY.length > touchSensitivity;

  if (!bool) {
    return cb(false, null);
  }

  var changedTouches = e.changedTouches[0];

  var xStart = touchArrX[0];
  var yStart = touchArrY[0];

  var xEnd = changedTouches.clientX;
  var yEnd = changedTouches.clientY;

  var intent = 0;
  var direction = VERTICAL;

  //determine vertical or horizontal based on the greatest difference
  if (Math.abs(xStart - xEnd) > Math.abs(yStart - yEnd)) {
    direction = HORIZONTAL;
  }

  swap.call(this, intent, direction);
  this.resetTouches();
  this.scrollPending = true;

  cb(this.scrollPending, this.currentDirection);
};

ScrollSwipe.prototype.getTouch = function getTouch(idx) {
  return this.touchArr[idx];
};

ScrollSwipe.prototype.addXTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrX.push(touch);
};

ScrollSwipe.prototype.addYTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrY.push(touch);
};

ScrollSwipe.prototype.resetTouches = function resetTouches() {
  this.touchArrX = [];
  this.touchArrY = [];
};

//wheel events
ScrollSwipe.prototype.addXScroll = function addXScroll(s) {
  this.latestScroll = s;
  this.xArr.push(s);
};

ScrollSwipe.prototype.addYScroll = function addYScroll(s) {
  this.latestScroll = s;
  this.yArr.push(s);
};

ScrollSwipe.prototype.getDirection = function getDirection() {
  return this.currentDirection;
};

ScrollSwipe.prototype.resetScroll = function resetScroll() {
  this.xArr = [];
  this.yArr = [];
};

ScrollSwipe.prototype.scrollFulfilled = function scrollFulfilled(cb) {
  if (!cb) {
    throw new Error('must provide callback to scrollFulfilled');
  }

  var xArr = this.xArr;
  var yArr = this.yArr;
  var scrollSensitivity = this.scrollSensitivity;

  var bool = xArr.length > scrollSensitivity && yArr.length > scrollSensitivity;

  var intent = 0;
  var direction = this.evalScrollDirection();

  if (bool) {
    console.log(this);
    swap.call(this, intent, direction);
    this.resetScroll();
    this.scrollPending = true;
  }

  cb(this.scrollPending, this.currentDirection);
};

ScrollSwipe.prototype.evalScrollDirection = function evalScrollDirection() {
  var _getSums = this.getSums();

  var x = _getSums.x;
  var y = _getSums.y;

  return x > y ? HORIZONTAL : VERTICAL;
};

ScrollSwipe.prototype.getSums = function getSums() {
  var xArr = this.xArr;
  var yArr = this.yArr;


  var x = xArr.reduce(function (result, curr) {
    return result += Math.abs(curr);
  }, 0);

  var y = yArr.reduce(function (result, curr) {
    return result += Math.abs(curr);
  }, 0);

  return { x: x, y: y };
};

ScrollSwipe.prototype.getScrollDirection = function getScrollDirection() {
  return this.currentDirection;
};

function swap(intent, direction) {
  this.previousIntent = this.currentIntent;
  this.currentIntent = intent;
  this.previousDirection = this.currentDirection;
  this.currentDirection = direction;
}
return ScrollSwipe;
}));
