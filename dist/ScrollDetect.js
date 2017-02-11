;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.ScrollDetect = factory();
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

function ScrollDetect(opts) {
  var _this = this;

  var optCopy = Object.keys(opts).forEach(function (key) {
    if (acceptedParams[key]) {
      _this[key] = opts[key];
      return;
    }

    throw new Error('unknown options for ScrollDetect: ' + key);
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
  var _this2 = this;

  this.target.addEventListener('wheel', function (e) {
    if (_this2.scrollPending) {
      return;
    }

    var x = e.deltaX;
    var y = e.deltaY;

    _this2.addXScroll(x);
    _this2.addYScroll(y);

    _this2.scrollFulfilled(function (fulfilled, direction) {
      if (!fulfilled) {
        return;
      }

      _this2.scrollCb(_this2.scrollPending, direction);
    });
  });
};

ScrollDetect.prototype.initTouch = function initTouch() {
  var _this3 = this;

  this.target.addEventListener('touchmove', function (e) {
    var changedTouches = e.changedTouches[0];
    var x = changedTouches.clientX;
    var y = changedTouches.clientY;

    _this3.addXTouch(x);
    _this3.addYTouch(y);
  });

  this.target.addEventListener('touchend', function (e) {
    _this3.touchFulfilled(e, function (fulfilled, direction) {
      if (!fulfilled) {
        return;
      }

      _this3.touchCb(_this3.scrollPending, direction);
    });
  });
};

//touch events
ScrollDetect.prototype.touchFulfilled = function touchFulfilled(e, cb) {
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

  var direction = VERTICAL;

  //determine vertical or horizontal based on the greatest difference
  if (Math.abs(xStart - xEnd) > Math.abs(yStart - yEnd)) {
    direction = HORIZONTAL;
  }

  this.latestDirection = direction;
  this.resetTouches();
  this.scrollPending = true;

  cb(this.scrollPending, this.latestDirection);
};

ScrollDetect.prototype.getTouch = function getTouch(idx) {
  return this.touchArr[idx];
};

ScrollDetect.prototype.addXTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrX.push(touch);
};

ScrollDetect.prototype.addYTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrY.push(touch);
};

ScrollDetect.prototype.resetTouches = function resetTouches() {
  this.touchArrX = [];
  this.touchArrY = [];
};

//wheel events
ScrollDetect.prototype.addXScroll = function addXScroll(s) {
  this.xArr.push(s);
};

ScrollDetect.prototype.addYScroll = function addYScroll(s) {
  this.yArr.push(s);
};

ScrollDetect.prototype.getDirection = function getDirection() {
  return this.latestDirection;
};

ScrollDetect.prototype.resetScroll = function resetScroll() {
  this.xArr = [];
  this.yArr = [];
};

ScrollDetect.prototype.scrollFulfilled = function scrollFulfilled(cb) {
  if (!cb) {
    throw new Error('must provide callback to scrollFulfilled');
  }

  var xArr = this.xArr;
  var yArr = this.yArr;
  var scrollSensitivity = this.scrollSensitivity;

  var bool = xArr.length > scrollSensitivity && yArr.length > scrollSensitivity;

  this.evalScrollDirection();

  if (bool) {
    this.resetScroll();
    this.scrollPending = true;
  }

  cb(this.scrollPending, this.latestDirection);
};

ScrollDetect.prototype.evalScrollDirection = function evalScrollDirection() {
  var _getSums = this.getSums();

  var x = _getSums.x;
  var y = _getSums.y;

  this.latestDirection = x > y ? HORIZONTAL : VERTICAL;
};

ScrollDetect.prototype.getSums = function getSums() {
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

ScrollDetect.prototype.getScrollDirection = function getScrollDirection() {
  return this.latestDirection;
};
return ScrollDetect;
}));
