var startLevel = getLevel();
var direction = 1;
var lastRandom = 0;
var animation;
var flasherTimer;
var lastCollusion;
var collusion = false;

function flasher(cls) {
  clearTimeout(flasherTimer);
  document.body.classList.add(cls);
  flasherTimer = setTimeout(function () {
    document.body.classList.remove(cls);
  }, 1000);
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

function assignLockPosition() {
  var lockPosition = randomRotate();
  document.getElementById("locker").style.transform = 'rotate('+ lockPosition +'deg)';
  return lockPosition;
}

function assignKeyPosition(pos) {
  document.getElementById("key").style.transform = 'rotate('+ pos +'deg)';
}

function getKeyPosition() {
  var degree = document.getElementById("key").style.transform.match(/\-?\d+/);
  return degree ? +degree[0] : 0;
}

function getLockPosition() {
  var degree = document.getElementById("locker").style.transform.match(/\-?\d+/);
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

function levelUp() {
  var newLevel = +localStorage.getItem('level') + 1;
  localStorage.setItem('level', newLevel);
  setLevel(newLevel);
  flasher('levelUp');
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
