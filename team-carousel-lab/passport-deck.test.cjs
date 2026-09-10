const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const count = needle => html.split(needle).length - 1;

assert.equal(count('isPlaceholder: true'), 4, 'four test-only placeholders must be present');
assert.match(html, /class="passport-scroll"/, 'passport deck must have a native scroll region');
assert.match(html, /function setupPassportDeck\(/, 'passport deck needs an interaction controller');
assert.match(html, /requestAnimationFrame/, 'overflowing deck needs slow automatic scrolling');
assert.match(html, /pointerdown/, 'desktop deck needs pointer drag support');
assert.match(html, /overflow-y: auto/, 'deck must retain native vertical scrolling');
assert.match(html, /scrollbar-width: none/, 'deck must hide its scrollbar');
assert.match(html, /touch-action: pan-y/, 'touch devices must keep vertical swipe scrolling');
assert.match(html, /const PASSPORT_DWELL_MS = 5000/, 'carousel must keep each member visible for five seconds');
assert.match(html, /const PASSPORT_PROGRESS_FINISH_MS = 180/, 'progress must finish shortly before the transition');
assert.match(html, /class="passport-progress"/, 'passport controls need progress pagination');
assert.match(html, /passport-motion-stage/, 'main card needs a motion stage');
assert.match(html, /function setupPassportCarouselMotion\(/, 'passport carousel needs a timer controller');
assert.match(html, /function transitionPassportMember\(/, 'passport carousel needs staged card transitions');

async function runDomTest() {
  const scriptStart = html.lastIndexOf('<script>') + '<script>'.length;
  const scriptEnd = html.lastIndexOf('</script>');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost/' });
  let clock = 0;
  let frameId = 0;
  const frames = [];
  dom.window.performance.now = () => clock;
  dom.window.requestAnimationFrame = callback => {
    frameId += 1;
    frames.push({ id: frameId, callback });
    return frameId;
  };
  dom.window.cancelAnimationFrame = id => {
    const index = frames.findIndex(frame => frame.id === id);
    if (index >= 0) frames.splice(index, 1);
  };
  dom.window.eval(html.slice(scriptStart, scriptEnd));

  const document = dom.window.document;
  let passport = [...document.querySelectorAll('section')].find(section => section.dataset.variant === 'passport');
  let deck = passport.querySelector('.passport-scroll');
  assert.equal(deck.querySelectorAll('.passport-thumb').length, 8, 'passport deck must render eight participant cards');
  assert.equal(deck.querySelectorAll('[data-placeholder="true"]').length, 4, 'passport deck must mark four test cards');
  deck.dispatchEvent(new dom.window.Event('mouseenter'));
  frames.shift().callback(0);
  frames.shift().callback(0);
  clock = 2500;
  frames.shift().callback(clock);
  assert.equal(Number(passport.querySelector('.passport-progress').style.getPropertyValue('--passport-progress')) > .4, true, 'timer must visibly advance progress before the next card');
  clock = 5000;
  frames.shift().callback(clock);
  await new Promise(resolve => dom.window.setTimeout(resolve, 250));
  passport = [...document.querySelectorAll('section')].find(section => section.dataset.variant === 'passport');
  deck = passport.querySelector('.passport-scroll');
  assert.equal(passport.querySelector('.counter').textContent.trim(), '2 / 8', 'timer must advance to the next member after five seconds');
  assert.equal(passport.querySelector('.passport-motion-stage').classList.contains('is-entering'), true, 'next main card must receive its entry animation hook');
  assert.equal(passport.hasAttribute('aria-live'), false, 'automatic card changes must not announce themselves continuously');
  const pointer = (type, properties) => {
    const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
    Object.entries(properties).forEach(([key, value]) => Object.defineProperty(event, key, { value }));
    return event;
  };
  deck.dispatchEvent(pointer('pointerdown', { pointerType: 'mouse', button: 0, pointerId: 7, clientY: 180 }));
  deck.dispatchEvent(pointer('pointermove', { pointerId: 7, clientY: 120 }));
  assert.equal(deck.classList.contains('is-dragging'), true, 'mouse movement must enter drag mode');
  assert.equal(deck.scrollTop, 60, 'mouse movement must move the native scroll position');
  deck.dispatchEvent(pointer('pointerup', { pointerId: 7 }));
  assert.equal(deck.classList.contains('is-dragging'), false, 'releasing the mouse must exit drag mode');
  deck.querySelectorAll('.passport-thumb')[2].click();
  assert.equal(passport.querySelector('.counter').textContent.trim(), '2 / 8', 'a completed drag must suppress its accidental click');
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  deck.querySelectorAll('.passport-thumb')[2].click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 250));
  const rerenderedPassport = [...document.querySelectorAll('section')].find(section => section.dataset.variant === 'passport');
  assert.equal(rerenderedPassport.querySelector('.counter').textContent.trim(), '3 / 8', 'clicking a deck card must select that member');
  assert.equal(rerenderedPassport.querySelectorAll('.passport-thumb')[2].getAttribute('aria-pressed'), 'true', 'selected deck card must expose its state');
  dom.window.close();
}

runDomTest().then(() => console.log('passport deck contract: passed')).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
