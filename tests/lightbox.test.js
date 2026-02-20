/**
 * Image Lightbox Tests
 * Nick Long Sports Photography Website
 *
 * Tests cover:
 *   1. Opening lightbox from portfolio cards
 *   2. Closing lightbox (button, backdrop, keyboard)
 *   3. Image navigation (next, prev, wrap-around)
 *   4. Counter display
 *   5. Body scroll lock
 *   6. Keyboard navigation
 *   7. Touch/swipe navigation
 *   8. Edge cases (invalid gallery, empty gallery)
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function buildLightboxDOM() {
  document.body.innerHTML = `
    <header class="navbar" id="navbar">
      <div class="navbar__container">
        <nav class="navbar__menu" id="navMenu">
          <a href="#home">Home</a>
        </nav>
        <button class="navbar__toggle" id="navToggle" aria-label="Toggle navigation menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <section class="section portfolio" id="portfolio">
      <article class="portfolio__card animate-on-scroll" data-gallery="basketball">
        <div class="portfolio__card-image">
          <img src="test.jpg" alt="test">
        </div>
      </article>
      <article class="portfolio__card animate-on-scroll" data-gallery="fnl">
        <div class="portfolio__card-image">
          <img src="test2.jpg" alt="test2">
        </div>
      </article>
      <article class="portfolio__card animate-on-scroll" data-gallery="nonexistent">
        <div class="portfolio__card-image">
          <img src="test3.jpg" alt="test3">
        </div>
      </article>
    </section>

    <div class="lightbox" id="lightbox">
      <button class="lightbox__close" aria-label="Close gallery">&times;</button>
      <button class="lightbox__prev" aria-label="Previous image">&#8249;</button>
      <button class="lightbox__next" aria-label="Next image">&#8250;</button>
      <div class="lightbox__content">
        <img class="lightbox__img" id="lightboxImg" src="" alt="Gallery photo">
      </div>
      <div class="lightbox__counter" id="lightboxCounter"></div>
    </div>
  `;
}

function clearDOM() {
  document.body.innerHTML = '';
}

function loadMainJS() {
  jest.resetModules();
  require('../js/main.js');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Image Lightbox - Opening', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildLightboxDOM();
    loadMainJS();
  });
  afterEach(() => clearDOM());

  test('clicking a portfolio card opens the lightbox', () => {
    const card = document.querySelector('[data-gallery="basketball"]');
    card.click();
    const lightbox = document.getElementById('lightbox');
    expect(lightbox.classList.contains('lightbox--open')).toBe(true);
  });

  test('opening lightbox sets body overflow to hidden', () => {
    const card = document.querySelector('[data-gallery="basketball"]');
    card.click();
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('opening lightbox shows the first image', () => {
    const card = document.querySelector('[data-gallery="fnl"]');
    card.click();
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('images/fnl/DO_OeiPDQQl_1.jpg');
  });

  test('opening lightbox displays counter as "1 / N"', () => {
    const card = document.querySelector('[data-gallery="fnl"]');
    card.click();
    const counter = document.getElementById('lightboxCounter');
    expect(counter.textContent).toBe('1 / 27');
  });

  test('clicking a card with nonexistent gallery does not open lightbox', () => {
    const card = document.querySelector('[data-gallery="nonexistent"]');
    card.click();
    const lightbox = document.getElementById('lightbox');
    expect(lightbox.classList.contains('lightbox--open')).toBe(false);
  });
});

describe('Image Lightbox - Closing', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildLightboxDOM();
    loadMainJS();
    // Open the lightbox first
    document.querySelector('[data-gallery="basketball"]').click();
  });
  afterEach(() => clearDOM());

  test('clicking close button closes the lightbox', () => {
    const closeBtn = document.querySelector('.lightbox__close');
    closeBtn.click();
    const lightbox = document.getElementById('lightbox');
    expect(lightbox.classList.contains('lightbox--open')).toBe(false);
  });

  test('closing lightbox restores body overflow', () => {
    const closeBtn = document.querySelector('.lightbox__close');
    closeBtn.click();
    expect(document.body.style.overflow).toBe('');
  });

  test('clicking the lightbox backdrop closes it', () => {
    const lightbox = document.getElementById('lightbox');
    // Simulate clicking the backdrop (target === lightbox itself)
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: lightbox });
    lightbox.dispatchEvent(event);
    expect(lightbox.classList.contains('lightbox--open')).toBe(false);
  });

  test('clicking inside lightbox content does NOT close it', () => {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    // Click on the image, not the backdrop
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: img });
    lightbox.dispatchEvent(event);
    expect(lightbox.classList.contains('lightbox--open')).toBe(true);
  });

  test('pressing Escape closes the lightbox', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const lightbox = document.getElementById('lightbox');
    expect(lightbox.classList.contains('lightbox--open')).toBe(false);
  });
});

describe('Image Lightbox - Navigation', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildLightboxDOM();
    loadMainJS();
    document.querySelector('[data-gallery="fnl"]').click();
  });
  afterEach(() => clearDOM());

  test('clicking next button advances to the second image', () => {
    const nextBtn = document.querySelector('.lightbox__next');
    nextBtn.click();
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('DO_OeiPDQQl_2.jpg');
  });

  test('counter updates after clicking next', () => {
    const nextBtn = document.querySelector('.lightbox__next');
    nextBtn.click();
    const counter = document.getElementById('lightboxCounter');
    expect(counter.textContent).toBe('2 / 27');
  });

  test('clicking prev button from first image wraps to last', () => {
    const prevBtn = document.querySelector('.lightbox__prev');
    prevBtn.click();
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('CyqhP_wuBDQ_9.jpg');
    const counter = document.getElementById('lightboxCounter');
    expect(counter.textContent).toBe('27 / 27');
  });

  test('clicking next from last image wraps to first', () => {
    const nextBtn = document.querySelector('.lightbox__next');
    // Navigate to last image (27 clicks for 27 items, wrap around)
    for (let i = 0; i < 27; i++) nextBtn.click();
    const img = document.getElementById('lightboxImg');
    // Should be back at image 1 (index 0)
    expect(img.src).toContain('DO_OeiPDQQl_1.jpg');
    const counter = document.getElementById('lightboxCounter');
    expect(counter.textContent).toBe('1 / 27');
  });

  test('ArrowRight key advances to next image', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('DO_OeiPDQQl_2.jpg');
  });

  test('ArrowLeft key goes to previous image', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('CyqhP_wuBDQ_9.jpg');
  });

  test('keyboard does nothing when lightbox is closed', () => {
    const closeBtn = document.querySelector('.lightbox__close');
    closeBtn.click();
    const img = document.getElementById('lightboxImg');
    const srcBefore = img.src;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(img.src).toBe(srcBefore);
  });
});

describe('Image Lightbox - Touch/Swipe', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildLightboxDOM();
    loadMainJS();
    document.querySelector('[data-gallery="fnl"]').click();
  });
  afterEach(() => clearDOM());

  function simulateSwipe(element, startX, endX) {
    element.dispatchEvent(new TouchEvent('touchstart', {
      changedTouches: [{ screenX: startX }]
    }));
    element.dispatchEvent(new TouchEvent('touchend', {
      changedTouches: [{ screenX: endX }]
    }));
  }

  test('swiping left (negative diff > 50) goes to next image', () => {
    const lightbox = document.getElementById('lightbox');
    simulateSwipe(lightbox, 300, 200); // diff = -100
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('DO_OeiPDQQl_2.jpg');
  });

  test('swiping right (positive diff > 50) goes to previous image', () => {
    const lightbox = document.getElementById('lightbox');
    simulateSwipe(lightbox, 200, 300); // diff = +100
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('CyqhP_wuBDQ_9.jpg');
  });

  test('small swipe (diff <= 50) does not navigate', () => {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const srcBefore = img.src;
    simulateSwipe(lightbox, 300, 270); // diff = -30
    expect(img.src).toBe(srcBefore);
  });

  test('swipe exactly at threshold (diff = 50) does not navigate', () => {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const srcBefore = img.src;
    simulateSwipe(lightbox, 300, 250); // diff = -50 (abs = 50, not > 50)
    expect(img.src).toBe(srcBefore);
  });

  test('swipe just over threshold (diff = 51) navigates', () => {
    const lightbox = document.getElementById('lightbox');
    simulateSwipe(lightbox, 300, 249); // diff = -51
    const img = document.getElementById('lightboxImg');
    expect(img.src).toContain('DO_OeiPDQQl_2.jpg');
  });
});

describe('Image Lightbox - Multiple galleries', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildLightboxDOM();
    loadMainJS();
  });
  afterEach(() => clearDOM());

  test('opening different galleries shows correct images', () => {
    const basketballCard = document.querySelector('[data-gallery="basketball"]');
    const fnlCard = document.querySelector('[data-gallery="fnl"]');
    const img = document.getElementById('lightboxImg');

    basketballCard.click();
    expect(img.src).toContain('basketball/');

    // Close and open another
    document.querySelector('.lightbox__close').click();
    fnlCard.click();
    expect(img.src).toContain('fnl/');
  });

  test('re-opening a gallery resets to first image', () => {
    const card = document.querySelector('[data-gallery="fnl"]');

    card.click();
    document.querySelector('.lightbox__next').click(); // go to image 2
    document.querySelector('.lightbox__close').click();

    card.click(); // re-open
    const counter = document.getElementById('lightboxCounter');
    expect(counter.textContent).toBe('1 / 27');
  });
});
