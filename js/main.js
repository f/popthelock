var startLevel = getLevel();
var direction = 1;
var lastRandom = 0;
var animation;
var flasherTimer;
var lastCollusion;
var collusion = false;
var blocked;

function flasher(cls, wait) {
  clearTimeout(flasherTimer);
  document.body.classList.add(cls);
  blocked = true;
  flasherTimer = setTimeout(function () {
    document.body.classList.remove(cls);
    blocked = false;
  }, wait || 400);
}

function getLevel() {
  return localStorage.getItem('level') || 1;
}

function rotate(deg) {
  return Math.floor(deg) % 360;
}

function randomRotate() {
  var newRandom = rotate(Math.random() * 1000);
  if (Math.abs(newRandom - lastRandom) < 60) {
    return randomRotate();
  }
  if (newRandom < 60 || newRandom > 300) {
    return randomRotate();
  }
  lastRandom = newRandom;
  return newRandom;
}

function transformer(element, value) {
  var el = document.getElementById(element);
  el.style.transform = value;
  el.style.WebkitTransform = value;
}

function assignLockPosition() {
  var lockPosition = randomRotate();
  transformer('locker', 'rotate('+ lockPosition +'deg)');
  return lockPosition;
}

function assignKeyPosition(pos) {
  transformer('key', 'rotate('+ pos +'deg)');
}

function getKeyPosition() {
  var el = document.getElementById("key");
  var degree = (el.style.transform || el.style.WebkitTransform).match(/\-?\d+/);
  return degree ? +degree[0] : 0;
}

function getLockPosition() {
  var el = document.getElementById("locker");
  var degree = (el.style.transform || el.style.WebkitTransform).match(/\-?\d+/);
  return degree ? +degree[0] : 0;
}

function checkCurrentCollusion() {
  var locker = 360 - (getLockPosition() % 360);
  var key = 360 - (getKeyPosition() % 360);
  var diff = Math.abs(locker - key) % 360;
  return (diff <= 7);
}

function checkCollision() {
  collusion = checkCurrentCollusion();
  if (collusion === true) {
    lastCollusion = collusion;
  }
  if (lastCollusion === true && collusion === false) {
    fail();
    lastCollusion = null;
  }
}

function playSound(soundfile) {
  if (!Audio) return;
  var audio = new Audio('./sounds/' + soundfile + '.wav');
  audio.play();
}

function levelUp() {
  var newLevel = +localStorage.getItem('level') + 1;
  (function (timeout) {
    flasher('levelUp', timeout);
    playSound('unlocked');
    setTimeout(function () {
      localStorage.setItem('level', newLevel);
      setLevel(newLevel);
    }, timeout / 2);
    setTimeout(function () {
      playSound('locked');
    }, timeout);
  })(2800);

}

function keySolved() {
  var currentKey = +document.getElementById("level").innerText - 1;
  document.getElementById("level").innerText = currentKey;
  return currentKey;
}

function setLevel(level) {
  document.getElementById("level").innerText = +(level || 1);
}

function correct() {
  lastCollusion = null;
  assignLockPosition();
  playSound('click');
  if (keySolved() === 0) {
    levelUp();
    reset();
  }
}

function fail() {
  flasher('fail');
  reset();
}

function reset() {
  cancelAnimationFrame(animation);
  assignKeyPosition(0);
  assignLockPosition();
  setLevel(localStorage.getItem('level'));
  setStartEvent(main);
  collusion = false;
}

function setStartEvent(fn) {
  document.body.onkeydown = document.body.onmousedown = function (e) {
    if (e.keyCode !== undefined && e.keyCode !== 32) {
      return;
    }
    if (blocked) {
      return;
    }
    fn();
  };
}

function main() {
  setLevel(getLevel());

  setStartEvent(function (e) {
    direction *= -1;
    if (checkCurrentCollusion()) {
      correct();
    } else {
      fail();
    }
  });

  function animate() {
    assignKeyPosition(getKeyPosition() + (2 * direction));
    animation = requestAnimationFrame(animate);
    checkCollision();
  }

  animation = requestAnimationFrame(animate);
}

assignLockPosition();
setLevel(getLevel());
setStartEvent(main);
