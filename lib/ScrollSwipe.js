const VERTICAL = 'VERTICAL';
const HORIZONTAL = 'HORIZONTAL';
const acceptedParams = new Set([
  'target',
  'scrollSensitivity',
  'touchSensitivity',
  'scrollCb',
  'touchCb',
  'scrollPreventDefault',
  'touchPreventDefault',
  'addEventListenerOptions'
]);
const noop = () => {};

if (typeof module !== 'undefined') {
  module.exports = ScrollSwipe;
}

function ScrollSwipe(opts) {
  Object.keys(opts).forEach(key => {
    if (acceptedParams.has(key)) {
      this[key] = opts[key];
      return;
    }

    throw new Error(`unknown options for ScrollSwipe: ${key}`)
  });

  if (!opts.target) {
    throw new Error('must provide DOM target element to ScrollSwipe');
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters
  this.addEventListenerOptions = this.addEventListenerOptions || {};

  if (!this.scrollSensitivity || this.scrollSensitivity < 0) {
    this.scrollSensitivity = 0;
  }

  if (!this.touchSensitivity || this.touchSensitivity < 0) {
    this.touchSensitivity = 0;
  }

  if (this.target.style || this.target.style.touchAction === '') {
    this.target.style.touchAction += 'manipulation'
  }

  this.scrollPending = false;
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
  this.intentMap = {
    'VERTICAL': {
      0: 'UP',
      1: 'DOWN'
    },
    'HORIZONTAL': {
      0: 'LEFT',
      1: 'RIGHT'
    }
  };

  this.init();

  return this;
}

ScrollSwipe.prototype.init = function init() {
  // only init if true
  if (this.scrollCb) {
    this.initScroll();
  }

  if (this.touchCb) {
    this.initTouch();
  }

  return this;
}

ScrollSwipe.prototype.listen = function listen() {
  this.flush();
  this.scrollPending = false;
  return this;
}

ScrollSwipe.prototype.onWheel = function onWheel(e) {
    if (this.scrollPreventDefault && !this.addEventListenerOptions.passive) {
      e.preventDefault();
    }

    if (this.scrollPending) {
      return;
    }

    this.startScrollEvent = e;

    const x = e.deltaX;
    const y = e.deltaY;

    this.addXScroll(x);
    this.addYScroll(y);

    this.scrollFulfilled((fulfilled, direction, intent) => {
      if (!fulfilled) {
        return;
      }

      this.lockout();
      this.latestScrollEvent = e;

      const result = this.buildResult({
        startEvent: this.latestScrollEvent,
        lastEvent: this.latestScrollEvent,
        direction,
        intent
      });

      this.scrollCb(result, this);
      this.undoLockout();
    });
}

ScrollSwipe.prototype.initScroll = function initScroll() {
  this.newOnWheel = this.onWheel.bind(this);

  if (this.target && this.target.addEventListener) {
    this.target.addEventListener('wheel', this.newOnWheel, this.addEventListenerOptions);
  }

  return this;
}

ScrollSwipe.prototype.touchMove = function touchMove(e) {
  if (this.touch && !this.addEventListenerOptions.passive) {
    e.preventDefault();
  }

  const changedTouches = e.changedTouches[0];
  const x = changedTouches.clientX;
  const y = changedTouches.clientY;

  this.startTouchEvent = e;
  this.addXTouch(x);
  this.addYTouch(y);
}

ScrollSwipe.prototype.buildResult = function buildResult({ startEvent, lastEvent, direction, intent }) {
  return {
    startEvent,
    lastEvent,
    direction,
    intent,
    scrollPending: this.scrollPending,
    mappedIntent: this.intentMap[direction][intent]
  };
}

ScrollSwipe.prototype.touchEnd = function touchEnd(e) {
  this.touchFulfilled(e, (fulfilled, direction, intent) => {
    if (!fulfilled) {
      return;
    }

    const result = this.buildResult({
      startEvent: this.startTouchEvent,
      lastEvent: this.latestTouchEvent,
      direction,
      intent
    });

    this.touchCb(result, this);
  });
}

ScrollSwipe.prototype.initTouch = function initTouch() {
  this.newTouchMove = this.touchMove.bind(this);
  this.newTouchEnd = this.touchEnd.bind(this);

  this.target.addEventListener('touchmove', this.newTouchMove, this.addEventListenerOptions);
  this.target.addEventListener('touchend', this.newTouchEnd, this.addEventListenerOptions);

  return this;
}

//touch events
ScrollSwipe.prototype.touchFulfilled = function touchFulfilled(e, cb) {
  if (!e) {
    throw new Error('must provide event to touchFulfilled');
  }

  if (!cb) {
    throw new Error('must provide callback to touchFulfilled');
  }

  const { touchSensitivity, touchArrX, touchArrY } = this;

  const bool = (touchArrX.length > touchSensitivity && touchArrY.length > touchSensitivity);

  if (!bool) {
    return cb(false, null);
  }

  const changedTouches = e.changedTouches[0];

  const xStart = touchArrX[0];
  const yStart = touchArrY[0];

  const xEnd = changedTouches.clientX;
  const yEnd = changedTouches.clientY;

  const xIntent = xStart < xEnd ? 0 : 1;
  const yIntent = yStart < yEnd ? 0 : 1;

  let direction = VERTICAL;

  //determine vertical or horizontal based on the greatest difference
  if ( Math.abs(xStart - xEnd) > Math.abs(yStart - yEnd) ) {
    direction = HORIZONTAL;
  }

  const intent = direction === VERTICAL ? yIntent : xIntent;

  swap.call(this, intent, direction);
  this.resetTouches();
  this.scrollPending = true;
  this.latestTouchEvent = e;

  cb(this.scrollPending, this.currentDirection, this.currentIntent);
  return this;
}

ScrollSwipe.prototype.getTouch = function getTouch(idx) {
  return this.touchArr[idx];
}

ScrollSwipe.prototype.addXTouch = function addTouch(touch) {
  if (this.pending()) {
    return this;
  }

  this.latestTouch = touch;
  this.touchArrX.push(touch);

  return this;
}

ScrollSwipe.prototype.addYTouch = function addTouch(touch) {
  if (this.pending()) {
    return this;
  }

  this.latestTouch = touch;
  this.touchArrY.push(touch);

  return this;
}

ScrollSwipe.prototype.resetTouches = function resetTouches() {
  this.touchArrX = [];
  this.touchArrY = [];
  return this;
}

//wheel events
ScrollSwipe.prototype.addXScroll = function addXScroll(s) {
  if (this.pending()) {
    return this;
  }

  this.latestScroll = s;
  this.xArr.push(s);
  return this;
}

ScrollSwipe.prototype.addYScroll = function addYScroll(s) {
  if (this.pending()) {
    return this;
  }

  this.latestScroll = s;
  this.yArr.push(s);
  return this;
}

ScrollSwipe.prototype.getDirection = function getDirection() {
  return this.currentDirection;
}

ScrollSwipe.prototype.resetScroll = function resetScroll() {
  this.xArr = [];
  this.yArr = [];

  return this;
}

ScrollSwipe.prototype.flush = function flush() {
  this.resetScroll();
  this.resetTouches();

  return this;
}

ScrollSwipe.prototype.lockout = function lockout() {
  this.originalAddXTouch = this.addXTouch;
  this.originalAddYTouch = this.addYTouch;

  this.originalAddXScroll = this.addXScroll;
  this.originalAddYScroll = this.addYScroll;

  this.addXScroll = noop;
  this.addYScroll = noop;
  this.addXTouch = noop;
  this.addYTouch = noop;

  return this;
};

ScrollSwipe.prototype.undoLockout = function undoLockout() {
  this.addXScroll = this.originalAddXScroll;
  this.addYScroll = this.originalAddYScroll;
  this.addXTouch = this.originalAddXTouch;
  this.addYTouch = this.originalAddYTouch;

  return this;
}

ScrollSwipe.prototype.scrollFulfilled = function scrollFulfilled(cb) {
  if (!cb) {
    throw new Error('must provide callback to scrollFulfilled');
  }

  const { xArr, yArr, scrollSensitivity } = this;
  const bool = (xArr.length > scrollSensitivity && yArr.length > scrollSensitivity);
  const { direction, intent } = this.evalScrollDirection();

  if (bool) {
    swap.call(this, intent, direction);
    this.resetScroll();
    this.scrollPending = true;
  }

  cb(this.scrollPending, this.currentDirection, this.currentIntent);
  return this;
}

ScrollSwipe.prototype.evalScrollDirection = function evalScrollDirection() {
  const { x, y, xIntent, yIntent } = this.getSums();
  const direction = x > y ? HORIZONTAL : VERTICAL;
  const base = direction === VERTICAL ? yIntent : xIntent;

  let intent = 0;

  if (base > 0) {
    intent = 1;
  }

  return { direction, intent };
}

ScrollSwipe.prototype.getSums = function getSums() {
  const { xArr, yArr } = this;

  let xIntent = 0;
  let yIntent = 0;

  const x = xArr.reduce((result, curr) => {
      xIntent = xIntent + curr;
      return result += Math.abs(curr);
    }, 0);

  const y = yArr.reduce((result, curr) => {
      yIntent = yIntent + curr;
      return result += Math.abs(curr);
    }, 0);

  return {x, y, xIntent, yIntent};
}

ScrollSwipe.prototype.getScrollDirection = function getScrollDirection() {
  return this.currentDirection;
}

ScrollSwipe.prototype.pending = function pending() {
  return this.scrollPending;
}

ScrollSwipe.prototype.killScroll = function killScroll() {
  if (this.target && this.target.removeEventListener) {
    this.target.removeEventListener('wheel', this.newOnWheel, false);
  }

  return this;
}

ScrollSwipe.prototype.killTouch = function killTouch() {
  if (this.target && this.target.removeEventListener) {
    this.target.removeEventListener('touchmove', this.newTouchMove, false);
    this.target.removeEventListener('touchend', this.newTouchEnd, false);
  }

  return this;
}

ScrollSwipe.prototype.killAll = function teardown() {
  this.killScroll().killTouch().flush();
  return this;
}

function swap(intent, direction) {
  this.previousIntent = this.currentIntent;
  this.currentIntent = intent;
  this.previousDirection = this.currentDirection;
  this.currentDirection = direction;
}
