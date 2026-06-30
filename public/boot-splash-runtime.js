/**
 * Boot splash runtime — до React, без модулей.
 * Sync: ui.ts (statusLines), bootSplash.ts (timings), bootSplashVisit.ts (skip rules).
 */
(function () {
  'use strict';

  /** @type {readonly string[]} Sync with UI.bootSplash.statusLines */
  var STATUS_LINES = [
    'Заряжаем powerbank на максимум',
    'Сверяем список «что взять с собой»',
    'Проверяем, что кроссовки уже разношены',
    'Договариваемся, кто везёт термос',
    'Смотрим радар — вдруг дождь',
    'Ищем в шкафу крем от солнца',
    'Пересчитываем перекус на всех',
  ];

  var BUBBLE_COUNT = 7;
  var STATUS_HOLD_MS = 1400;
  var STATUS_FADE_MS = 180;

  var statusIndex = 0;
  var statusFading = false;
  var animTimerId = null;
  var reducedMotion = false;
  var statusPaused = false;
  var appReady = false;
  var shownAt = 0;

  var splash = null;
  var bubblesEl = null;
  var statusA = null;
  var statusB = null;
  var activeStatus = null;
  var idleStatus = null;

  function setStatusLine(text) {
    if (!splash) {
      return;
    }
    splash.setAttribute('aria-label', 'Загрузка: ' + text);
  }

  function renderBubbles(filledCount) {
    if (!bubblesEl) {
      return;
    }

    var filled = Math.min(BUBBLE_COUNT, Math.max(0, filledCount));
    var children = bubblesEl.children;
    for (var i = 0; i < children.length; i++) {
      var bubble = children[i];
      var isFilled = i < filled;
      bubble.classList.toggle('is-filled', isFilled);
      bubble.classList.toggle(
        'is-current',
        isFilled && i === filled - 1 && (!appReady || filled < BUBBLE_COUNT),
      );
    }

    bubblesEl.setAttribute('aria-valuenow', String(filled));
    if (splash) {
      splash.setAttribute('aria-valuenow', String(filled));
    }
  }

  function showStatusAtIndex(targetIndex, animate) {
    if (!activeStatus || !idleStatus) {
      return;
    }

    var nextText = STATUS_LINES[targetIndex];
    if (targetIndex === statusIndex && activeStatus.textContent === nextText) {
      renderBubbles(targetIndex + 1);
      return;
    }

    if (!animate || statusPaused || reducedMotion) {
      statusFading = false;
      statusIndex = targetIndex;
      activeStatus.textContent = nextText;
      activeStatus.className = 'boot-status is-active';
      idleStatus.className = 'boot-status';
      idleStatus.textContent = '';
      setStatusLine(nextText);
      renderBubbles(statusIndex + 1);
      return;
    }

    if (statusFading) {
      return;
    }

    statusFading = true;
    var fadeMs = STATUS_FADE_MS;

    idleStatus.textContent = nextText;
    idleStatus.className = 'boot-status is-active';
    activeStatus.className = 'boot-status is-exiting';

    window.setTimeout(function () {
      activeStatus.className = 'boot-status';
      activeStatus.textContent = '';
      var prev = activeStatus;
      activeStatus = idleStatus;
      idleStatus = prev;
      statusIndex = targetIndex;
      statusFading = false;
      setStatusLine(nextText);
      renderBubbles(statusIndex + 1);
    }, fadeMs);
  }

  function advanceAnimation() {
    if (appReady || statusPaused || statusFading || splash.classList.contains('boot-splash--hide')) {
      return;
    }

    var nextIndex = (statusIndex + 1) % STATUS_LINES.length;
    showStatusAtIndex(nextIndex, !reducedMotion);
  }

  function stopAnimation() {
    if (animTimerId != null) {
      window.clearInterval(animTimerId);
      animTimerId = null;
    }
  }

  function startAnimation() {
    stopAnimation();
    if (appReady) {
      return;
    }
    animTimerId = window.setInterval(advanceAnimation, STATUS_HOLD_MS);
  }

  function restartStatusRotation() {
    appReady = false;
    statusIndex = 0;
    statusFading = false;
    statusPaused = false;
    shownAt = performance.now();
    showStatusAtIndex(0, false);
    startAnimation();
  }

  function setStatusTimings(holdMs, fadeMs) {
    STATUS_HOLD_MS = holdMs;
    STATUS_FADE_MS = fadeMs;
    startAnimation();
  }

  function toggleStatusPause() {
    statusPaused = !statusPaused;
    if (statusPaused) {
      stopAnimation();
    } else {
      startAnimation();
    }
    return statusPaused;
  }

  function initDom() {
    splash = document.getElementById('app-boot-splash');
    if (!splash) {
      return false;
    }

    bubblesEl = splash.querySelector('.boot-bubbles');
    statusA = splash.querySelector('#boot-status-a');
    statusB = splash.querySelector('#boot-status-b');

    if (statusA && statusB) {
      activeStatus = statusA;
      idleStatus = statusB;
    }

    if (bubblesEl && bubblesEl.children.length === 0) {
      for (var i = 0; i < BUBBLE_COUNT; i++) {
        var span = document.createElement('span');
        span.className = 'boot-bubble';
        bubblesEl.appendChild(span);
      }
    }

    showStatusAtIndex(0, false);
    return true;
  }

  function markAppReady() {
    appReady = true;
    stopAnimation();
    renderBubbles(BUBBLE_COUNT);
  }

  function boot() {
    if (document.documentElement.hasAttribute('data-skip-boot-splash')) {
      return;
    }

    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!initDom()) {
      return;
    }
    shownAt = performance.now();
    startAnimation();
  }

  window.__vkBootSplash = {
    markAppReady: markAppReady,
    setStatusTimings: setStatusTimings,
    toggleStatusPause: toggleStatusPause,
    restartStatusRotation: restartStatusRotation,
    getStatusIndex: function () {
      return statusIndex;
    },
    getStatusText: function () {
      return STATUS_LINES[statusIndex] || '';
    },
    getShownAt: function () {
      return shownAt;
    },
  };

  // ponytail: скрипт в конце body — splash уже в DOM; defer на DCL ломает порядок
  // относительно type=module в <head> (React успевает вызвать markAppReady до init).
  boot();
})();
