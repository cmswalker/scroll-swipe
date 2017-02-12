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
  touchCb: true,
  scrollPreventDefault: true,
  touchPreventDefault: true
};

if (typeof module !== 'undefined') {
  module.exports = ScrollSwipe;
}

function ScrollSwipe(opts) {
  var _this = this;

  Object.keys(opts).forEach(function (key) {
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

  this.startTouchEvent = null;
  this.latestTouchEvent = null;
  this.latestTouch = null;

  this.startScrollEvent = null;
  this.latestScrollEvent = null;
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

  return this;
}

ScrollSwipe.prototype.listen = function listen() {
  this.scrollPending = false;
  return this;
};

ScrollSwipe.prototype.killScroll = function killScroll() {
  this.target.removeEventListener('wheel');
  return this;
};

ScrollSwipe.prototype.killTouch = function killTouch() {
  this.target.removeEventListener('touchmove');
  this.target.removeEventListener('touchend');
  return this;
};

ScrollSwipe.prototype.killAll = function teardown() {
  this.killScroll().killTouch();
  return this;
};

ScrollSwipe.prototype.initScroll = function initScroll() {
  var _this2 = this;

  this.target.addEventListener('wheel', function (e) {
    if (_this2.scrollPreventDefault) {
      e.preventDefault();
    }

    if (_this2.scrollPending) {
      return;
    }

    _this2.startScrollEvent = e;

    var x = e.deltaX;
    var y = e.deltaY;

    _this2.addXScroll(x);
    _this2.addYScroll(y);

    _this2.scrollFulfilled(function (fulfilled, direction, intent) {
      if (!fulfilled) {
        return;
      }

      _this2.latestScrollEvent = e;

      var result = {
        startEvent: e,
        lastEvent: _this2.latestScrollEvent,
        scrollPending: _this2.scrollPending,
        direction: direction,
        intent: intent
      };

      _this2.scrollCb(result);
    });
  });

  return this;
};

ScrollSwipe.prototype.initTouch = function initTouch() {
  var _this3 = this;

  this.target.addEventListener('touchmove', function (e) {

    if (_this3.touchPreventDefault) {
      e.preventDefault();
    }

    var changedTouches = e.changedTouches[0];
    var x = changedTouches.clientX;
    var y = changedTouches.clientY;

    _this3.startTouchEvent = e;
    _this3.addXTouch(x);
    _this3.addYTouch(y);
  });

  this.target.addEventListener('touchend', function (e) {
    if (_this3.touchPreventDefault) {
      e.preventDefault();
    }

    _this3.touchFulfilled(e, function (fulfilled, direction, intent) {
      if (!fulfilled) {
        return;
      }

      var result = {
        startEvent: _this3.startTouchEvent,
        lastEvent: _this3.latestTouchEvent,
        scrollPending: _this3.scrollPending,
        direction: direction,
        intent: intent
      };

      _this3.touchCb(result);
    });
  });

  return this;
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

  var xIntent = xStart < xEnd ? 1 : 0;
  var yIntent = yStart < yEnd ? 1 : 0;

  var direction = VERTICAL;

  //determine vertical or horizontal based on the greatest difference
  if (Math.abs(xStart - xEnd) > Math.abs(yStart - yEnd)) {
    direction = HORIZONTAL;
  }

  var intent = direction === VERTICAL ? yIntent : xIntent;

  swap.call(this, intent, direction);
  this.resetTouches();
  this.scrollPending = true;
  this.latestTouchEvent = e;

  cb(this.scrollPending, this.currentDirection, this.currentIntent);
  return this;
};

ScrollSwipe.prototype.getTouch = function getTouch(idx) {
  return this.touchArr[idx];
};

ScrollSwipe.prototype.addXTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrX.push(touch);
  return this;
};

ScrollSwipe.prototype.addYTouch = function addTouch(touch) {
  this.latestTouch = touch;
  this.touchArrY.push(touch);
  return this;
};

ScrollSwipe.prototype.resetTouches = function resetTouches() {
  this.touchArrX = [];
  this.touchArrY = [];
  return this;
};

//wheel events
ScrollSwipe.prototype.addXScroll = function addXScroll(s) {
  this.latestScroll = s;
  this.xArr.push(s);
  return this;
};

ScrollSwipe.prototype.addYScroll = function addYScroll(s) {
  this.latestScroll = s;
  this.yArr.push(s);
  return this;
};

ScrollSwipe.prototype.getDirection = function getDirection() {
  return this.currentDirection;
};

ScrollSwipe.prototype.resetScroll = function resetScroll() {
  this.xArr = [];
  this.yArr = [];
  return this;
};

ScrollSwipe.prototype.scrollFulfilled = function scrollFulfilled(cb) {
  if (!cb) {
    throw new Error('must provide callback to scrollFulfilled');
  }

  var xArr = this.xArr;
  var yArr = this.yArr;
  var scrollSensitivity = this.scrollSensitivity;


  var bool = xArr.length > scrollSensitivity && yArr.length > scrollSensitivity;

  var _evalScrollDirection = this.evalScrollDirection();

  var direction = _evalScrollDirection.direction;
  var intent = _evalScrollDirection.intent;


  if (bool) {
    swap.call(this, intent, direction);
    this.resetScroll();
    this.scrollPending = true;
  }

  cb(this.scrollPending, this.currentDirection, this.currentIntent);
  return this;
};

ScrollSwipe.prototype.evalScrollDirection = function evalScrollDirection() {
  var _getSums = this.getSums();

  var x = _getSums.x;
  var y = _getSums.y;
  var xIntent = _getSums.xIntent;
  var yIntent = _getSums.yIntent;

  var direction = x > y ? HORIZONTAL : VERTICAL;
  var base = direction === VERTICAL ? yIntent : xIntent;

  var intent = 0;

  if (base > 0) {
    intent = 1;
  }

  return { direction: direction, intent: intent };
};

ScrollSwipe.prototype.getSums = function getSums() {
  var xArr = this.xArr;
  var yArr = this.yArr;


  var xIntent = 0;
  var yIntent = 0;

  var x = xArr.reduce(function (result, curr) {
    xIntent = xIntent + curr;
    return result += Math.abs(curr);
  }, 0);

  var y = yArr.reduce(function (result, curr) {
    yIntent = yIntent + curr;
    return result += Math.abs(curr);
  }, 0);

  return { x: x, y: y, xIntent: xIntent, yIntent: yIntent };
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
