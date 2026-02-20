/**
 * QA Test Suite for main.js
 * Nick Long Sports Photography Website
 *
 * Tests cover:
 *   1. Mobile menu toggle (open/close, link click closes menu)
 *   2. Navbar scroll background
 *   3. Scroll-triggered fade-in animations (IntersectionObserver)
 *   4. Reels video play/pause (IntersectionObserver)
 *   5. Null-safety (missing DOM elements don't crash)
 *   6. Event listener registration
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal DOM that mirrors index.html's relevant structure. */
function buildFullDOM() {
  document.body.innerHTML = `
    <header class="navbar" id="navbar">
      <div class="navbar__container">
        <nav class="navbar__menu" id="navMenu">
          <a href="#home">Home</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#reels">Reels</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
        <button class="navbar__toggle" id="navToggle" aria-label="Toggle navigation menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    <section class="section portfolio" id="portfolio">
      <div class="section__header animate-on-scroll">
        <h2 class="section__title">SELECTED WORK</h2>
      </div>
    </section>
    <section class="reels-section" id="reels">
      <div class="reels-marquee">
        <div class="reels-marquee__track">
          <div class="reels-marquee__item"><video src="reel1.mp4" muted loop playsinline></video></div>
          <div class="reels-marquee__item"><video src="reel2.mp4" muted loop playsinline></video></div>
        </div>
      </div>
    </section>
    <section class="section about" id="about">
      <div class="about__content animate-on-scroll">
        <h2>ABOUT NICK</h2>
      </div>
    </section>
  `;
}

/** Clear the DOM completely. */
function clearDOM() {
  document.body.innerHTML = '';
}

/**
 * Install IntersectionObserver mock on global.
 * Returns the shared instances array that captures created observers.
 */
function mockIntersectionObserver() {
  const instances = [];
  global.IntersectionObserver = function (callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    this.observe = jest.fn((el) => { this.observed.push(el); });
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    instances.push(this);
  };
  return instances;
}

/**
 * Load (re-evaluate) main.js in the current jsdom context.
 * Uses jest.resetModules() to bypass Jest's module registry cache.
 */
function loadMainJS() {
  jest.resetModules();
  require('../js/main.js');
}

/**
 * Simulate window.scrollY being a particular value.
 */
function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', {
    value,
    writable: true,
    configurable: true,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('main.js - Mobile menu toggle', () => {
  let navToggle, navMenu;

  beforeEach(() => {
    mockIntersectionObserver();
    buildFullDOM();
    loadMainJS();
    navToggle = document.getElementById('navToggle');
    navMenu = document.getElementById('navMenu');
  });

  afterEach(() => clearDOM());

  test('clicking the toggle opens the menu (adds open & active classes)', () => {
    navToggle.click();
    expect(navMenu.classList.contains('navbar__menu--open')).toBe(true);
    expect(navToggle.classList.contains('navbar__toggle--active')).toBe(true);
  });

  test('clicking the toggle twice closes the menu', () => {
    navToggle.click(); // open
    navToggle.click(); // close
    expect(navMenu.classList.contains('navbar__menu--open')).toBe(false);
    expect(navToggle.classList.contains('navbar__toggle--active')).toBe(false);
  });

  test('clicking a nav link closes the menu', () => {
    navToggle.click(); // open
    const firstLink = navMenu.querySelector('a');
    firstLink.click();
    expect(navMenu.classList.contains('navbar__menu--open')).toBe(false);
    expect(navToggle.classList.contains('navbar__toggle--active')).toBe(false);
  });

  test('clicking each nav link individually closes the menu', () => {
    const links = navMenu.querySelectorAll('a');
    links.forEach((link) => {
      // Manually set open state so we test each link in isolation
      navMenu.classList.add('navbar__menu--open');
      navToggle.classList.add('navbar__toggle--active');
      link.click();
      expect(navMenu.classList.contains('navbar__menu--open')).toBe(false);
      expect(navToggle.classList.contains('navbar__toggle--active')).toBe(false);
    });
  });

  test('menu starts closed (no open class by default)', () => {
    expect(navMenu.classList.contains('navbar__menu--open')).toBe(false);
    expect(navToggle.classList.contains('navbar__toggle--active')).toBe(false);
  });
});

describe('main.js - Navbar scroll behaviour', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildFullDOM();
    loadMainJS();
  });

  afterEach(() => {
    clearDOM();
    setScrollY(0);
  });

  test('adds navbar--scrolled when scrollY > 50', () => {
    const navbar = document.getElementById('navbar');
    setScrollY(100);
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('navbar--scrolled')).toBe(true);
  });

  test('removes navbar--scrolled when scrollY <= 50', () => {
    const navbar = document.getElementById('navbar');

    setScrollY(100);
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('navbar--scrolled')).toBe(true);

    setScrollY(10);
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('navbar--scrolled')).toBe(false);
  });

  test('navbar--scrolled is absent at exactly scrollY = 50', () => {
    const navbar = document.getElementById('navbar');
    setScrollY(50);
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('navbar--scrolled')).toBe(false);
  });

  test('navbar--scrolled is present at scrollY = 51', () => {
    const navbar = document.getElementById('navbar');
    setScrollY(51);
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.classList.contains('navbar--scrolled')).toBe(true);
  });
});

describe('main.js - Scroll animation IntersectionObserver', () => {
  let observers;

  beforeEach(() => {
    observers = mockIntersectionObserver();
    buildFullDOM();
    loadMainJS();
  });

  afterEach(() => clearDOM());

  test('creates at least one IntersectionObserver', () => {
    expect(observers.length).toBeGreaterThanOrEqual(1);
  });

  test('observes all .animate-on-scroll elements', () => {
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const scrollObs = observers[0];
    expect(scrollObs.observed.length).toBe(scrollElements.length);
    scrollElements.forEach((el, i) => {
      expect(scrollObs.observed[i]).toBe(el);
    });
  });

  test('adds animate--visible class when element becomes intersecting', () => {
    const scrollObs = observers[0];
    const target = scrollObs.observed[0];
    scrollObs.callback([{ target, isIntersecting: true }]);
    expect(target.classList.contains('animate--visible')).toBe(true);
  });

  test('unobserves element after it becomes visible (one-shot animation)', () => {
    const scrollObs = observers[0];
    const target = scrollObs.observed[0];
    scrollObs.callback([{ target, isIntersecting: true }]);
    expect(scrollObs.unobserve).toHaveBeenCalledWith(target);
  });

  test('does NOT add animate--visible when element is NOT intersecting', () => {
    const scrollObs = observers[0];
    const target = scrollObs.observed[0];
    scrollObs.callback([{ target, isIntersecting: false }]);
    expect(target.classList.contains('animate--visible')).toBe(false);
  });

  test('does NOT unobserve when element is not intersecting', () => {
    const scrollObs = observers[0];
    const target = scrollObs.observed[0];
    scrollObs.callback([{ target, isIntersecting: false }]);
    expect(scrollObs.unobserve).not.toHaveBeenCalled();
  });

  test('threshold is set to 0.1', () => {
    const scrollObs = observers[0];
    expect(scrollObs.options.threshold).toBe(0.1);
  });
});

describe('main.js - Reels video play/pause IntersectionObserver', () => {
  let observers;

  beforeEach(() => {
    observers = mockIntersectionObserver();
    buildFullDOM();
    loadMainJS();
  });

  afterEach(() => clearDOM());

  test('creates a second IntersectionObserver for reels', () => {
    expect(observers.length).toBeGreaterThanOrEqual(2);
  });

  test('observes all .reels-marquee__item elements', () => {
    const reelItems = document.querySelectorAll('.reels-marquee__item');
    const reelsObs = observers[1];
    expect(reelsObs.observed.length).toBe(reelItems.length);
  });

  test('plays video when reel item becomes intersecting', () => {
    const reelsObs = observers[1];
    const target = reelsObs.observed[0];
    const video = target.querySelector('video');
    video.play = jest.fn().mockReturnValue(Promise.resolve());

    reelsObs.callback([{ target, isIntersecting: true }]);
    expect(video.play).toHaveBeenCalled();
  });

  test('pauses video when reel item leaves viewport', () => {
    const reelsObs = observers[1];
    const target = reelsObs.observed[0];
    const video = target.querySelector('video');
    video.play = jest.fn().mockReturnValue(Promise.resolve());
    video.pause = jest.fn();

    reelsObs.callback([{ target, isIntersecting: false }]);
    expect(video.pause).toHaveBeenCalled();
  });

  test('does not crash when .reels-marquee__item has no video child', () => {
    const reelsObs = observers[1];
    const fakeTarget = document.createElement('div');
    fakeTarget.classList.add('reels-marquee__item');

    expect(() => {
      reelsObs.callback([{ target: fakeTarget, isIntersecting: true }]);
    }).not.toThrow();
  });

  test('reels observer threshold is set to 0.1', () => {
    const reelsObs = observers[1];
    expect(reelsObs.options.threshold).toBe(0.1);
  });
});

describe('main.js - Null safety (missing DOM elements)', () => {
  afterEach(() => clearDOM());

  test('does not throw when navToggle is missing', () => {
    mockIntersectionObserver();
    document.body.innerHTML = `
      <header class="navbar" id="navbar"></header>
      <nav class="navbar__menu" id="navMenu"><a href="#home">Home</a></nav>
    `;
    expect(() => loadMainJS()).not.toThrow();
  });

  test('does not throw when navMenu is missing', () => {
    mockIntersectionObserver();
    document.body.innerHTML = `
      <header class="navbar" id="navbar"></header>
      <button id="navToggle"></button>
    `;
    expect(() => loadMainJS()).not.toThrow();
  });

  test('does not throw when navbar is missing', () => {
    mockIntersectionObserver();
    document.body.innerHTML = `
      <button id="navToggle"></button>
      <nav id="navMenu"><a href="#home">Home</a></nav>
    `;
    expect(() => loadMainJS()).not.toThrow();
  });

  test('does not throw when both navToggle and navMenu are missing', () => {
    mockIntersectionObserver();
    document.body.innerHTML = '<header class="navbar" id="navbar"></header>';
    expect(() => loadMainJS()).not.toThrow();
  });

  test('does not throw on a completely empty DOM', () => {
    mockIntersectionObserver();
    clearDOM();
    expect(() => loadMainJS()).not.toThrow();
  });

  test('no scroll listener attached when navbar is absent', () => {
    mockIntersectionObserver();
    clearDOM();
    const spy = jest.spyOn(window, 'addEventListener');
    loadMainJS();
    const scrollCalls = spy.mock.calls.filter(c => c[0] === 'scroll');
    expect(scrollCalls.length).toBe(0);
    spy.mockRestore();
  });
});

describe('main.js - Event listener registration', () => {
  afterEach(() => clearDOM());

  test('registers a scroll listener on the window', () => {
    mockIntersectionObserver();
    buildFullDOM();
    const spy = jest.spyOn(window, 'addEventListener');
    loadMainJS();
    const scrollCalls = spy.mock.calls.filter(c => c[0] === 'scroll');
    expect(scrollCalls.length).toBe(1);
    spy.mockRestore();
  });

  test('scroll listener is registered with passive: true', () => {
    mockIntersectionObserver();
    buildFullDOM();
    const spy = jest.spyOn(window, 'addEventListener');
    loadMainJS();
    const scrollCall = spy.mock.calls.find(c => c[0] === 'scroll');
    expect(scrollCall).toBeDefined();
    expect(scrollCall[2]).toEqual({ passive: true });
    spy.mockRestore();
  });

  test('registers click listener on navToggle', () => {
    mockIntersectionObserver();
    buildFullDOM();
    const toggle = document.getElementById('navToggle');
    const spy = jest.spyOn(toggle, 'addEventListener');
    loadMainJS();
    expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    spy.mockRestore();
  });

  test('registers click listener on every nav menu link', () => {
    mockIntersectionObserver();
    buildFullDOM();
    const links = document.querySelectorAll('#navMenu a');
    const spies = Array.from(links).map(link => jest.spyOn(link, 'addEventListener'));
    loadMainJS();
    spies.forEach(spy => {
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
      spy.mockRestore();
    });
  });
});

describe('main.js - Multiple entries in single IntersectionObserver callback', () => {
  let observers;

  beforeEach(() => {
    observers = mockIntersectionObserver();
    buildFullDOM();
    loadMainJS();
  });

  afterEach(() => clearDOM());

  test('handles batch of mixed intersecting/non-intersecting entries (scroll observer)', () => {
    const scrollObs = observers[0];
    const targets = scrollObs.observed;

    scrollObs.callback([
      { target: targets[0], isIntersecting: true },
      { target: targets[1], isIntersecting: false },
    ]);

    expect(targets[0].classList.contains('animate--visible')).toBe(true);
    expect(targets[1].classList.contains('animate--visible')).toBe(false);
  });

  test('handles batch of all intersecting entries (reels observer)', () => {
    const reelsObs = observers[1];
    const targets = reelsObs.observed;

    targets.forEach(t => {
      const v = t.querySelector('video');
      if (v) {
        v.play = jest.fn().mockReturnValue(Promise.resolve());
        v.pause = jest.fn();
      }
    });

    const entries = targets.map(target => ({ target, isIntersecting: true }));
    reelsObs.callback(entries);

    targets.forEach(t => {
      const v = t.querySelector('video');
      if (v) expect(v.play).toHaveBeenCalled();
    });
  });
});
