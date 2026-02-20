/**
 * Video Lightbox & Video Work Card Tests
 * Nick Long Sports Photography Website
 *
 * Tests cover:
 *   1. Video Work card IntersectionObserver (autoplay when in view)
 *   2. Video lightbox open/close
 *   3. Video navigation (next, prev, wrap-around)
 *   4. showVideo canplay handler
 *   5. Keyboard navigation
 *   6. Touch/swipe navigation
 *   7. Body scroll lock
 *   8. Backdrop click close
 *   9. Null safety when videoWorkCard is missing
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

function buildVideoDOM() {
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
      <article class="portfolio__card animate-on-scroll" id="videoWorkCard">
        <div class="portfolio__card-image">
          <video class="portfolio__card-video" src="images/reels/DI10aTBRffO.mp4" muted loop playsinline preload="metadata"></video>
        </div>
      </article>
    </section>

    <div class="video-lightbox" id="videoLightbox">
      <button class="video-lightbox__close" aria-label="Close video gallery">&times;</button>
      <button class="video-lightbox__prev" aria-label="Previous video">&#8249;</button>
      <button class="video-lightbox__next" aria-label="Next video">&#8250;</button>
      <div class="video-lightbox__content">
        <video class="video-lightbox__video" id="videoLightboxPlayer" muted loop playsinline preload="none"></video>
      </div>
      <div class="video-lightbox__counter" id="videoLightboxCounter"></div>
    </div>

    <div class="lightbox" id="lightbox">
      <button class="lightbox__close">&times;</button>
      <button class="lightbox__prev">&#8249;</button>
      <button class="lightbox__next">&#8250;</button>
      <div class="lightbox__content">
        <img class="lightbox__img" id="lightboxImg" src="" alt="">
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

function mockVideoMethods() {
  const player = document.getElementById('videoLightboxPlayer');
  player.play = jest.fn().mockReturnValue(Promise.resolve());
  player.pause = jest.fn();
  player.load = jest.fn();

  const previewVideo = document.querySelector('#videoWorkCard video');
  if (previewVideo) {
    previewVideo.play = jest.fn().mockReturnValue(Promise.resolve());
    previewVideo.pause = jest.fn();
  }

  return { player, previewVideo };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Video Work Card - IntersectionObserver', () => {
  let observers;

  beforeEach(() => {
    observers = mockIntersectionObserver();
    buildVideoDOM();
    const previewVideo = document.querySelector('#videoWorkCard video');
    previewVideo.play = jest.fn().mockReturnValue(Promise.resolve());
    previewVideo.pause = jest.fn();
    loadMainJS();
  });
  afterEach(() => clearDOM());

  test('creates an IntersectionObserver for the video work card', () => {
    // Observer 0 = scroll animations, 1 = reels, 2 = video work card
    const cardObserver = observers.find(obs => obs.options.threshold === 0.3);
    expect(cardObserver).toBeDefined();
  });

  test('observes the videoWorkCard element', () => {
    const cardObserver = observers.find(obs => obs.options.threshold === 0.3);
    const videoWorkCard = document.getElementById('videoWorkCard');
    expect(cardObserver.observed).toContain(videoWorkCard);
  });

  test('plays preview video when card is intersecting', () => {
    const cardObserver = observers.find(obs => obs.options.threshold === 0.3);
    const videoWorkCard = document.getElementById('videoWorkCard');
    const previewVideo = videoWorkCard.querySelector('video');
    previewVideo.play = jest.fn().mockReturnValue(Promise.resolve());

    cardObserver.callback([{ target: videoWorkCard, isIntersecting: true }]);
    expect(previewVideo.play).toHaveBeenCalled();
  });

  test('pauses preview video when card leaves viewport', () => {
    const cardObserver = observers.find(obs => obs.options.threshold === 0.3);
    const videoWorkCard = document.getElementById('videoWorkCard');
    const previewVideo = videoWorkCard.querySelector('video');
    previewVideo.pause = jest.fn();

    cardObserver.callback([{ target: videoWorkCard, isIntersecting: false }]);
    expect(previewVideo.pause).toHaveBeenCalled();
  });

  test('card observer uses threshold of 0.3', () => {
    const cardObserver = observers.find(obs => obs.options.threshold === 0.3);
    expect(cardObserver).toBeDefined();
    expect(cardObserver.options.threshold).toBe(0.3);
  });
});

describe('Video Lightbox - Opening', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildVideoDOM();
    loadMainJS();
    mockVideoMethods();
  });
  afterEach(() => clearDOM());

  test('clicking video work card opens the video lightbox', () => {
    const card = document.getElementById('videoWorkCard');
    card.click();
    const vl = document.getElementById('videoLightbox');
    expect(vl.classList.contains('video-lightbox--open')).toBe(true);
  });

  test('opening sets body overflow to hidden', () => {
    document.getElementById('videoWorkCard').click();
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('opening sets the first video source', () => {
    document.getElementById('videoWorkCard').click();
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('DI10aTBRffO.mp4');
  });

  test('opening displays counter as "1 / 7"', () => {
    document.getElementById('videoWorkCard').click();
    const counter = document.getElementById('videoLightboxCounter');
    expect(counter.textContent).toBe('1 / 7');
  });

  test('opening calls player.load()', () => {
    const { player } = mockVideoMethods();
    document.getElementById('videoWorkCard').click();
    expect(player.load).toHaveBeenCalled();
  });
});

describe('Video Lightbox - canplay handler', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildVideoDOM();
    loadMainJS();
  });
  afterEach(() => clearDOM());

  test('sets oncanplay handler on player after showVideo', () => {
    const player = document.getElementById('videoLightboxPlayer');
    player.play = jest.fn().mockReturnValue(Promise.resolve());
    player.pause = jest.fn();
    player.load = jest.fn();

    document.getElementById('videoWorkCard').click();
    expect(typeof player.oncanplay).toBe('function');
  });

  test('oncanplay calls play() and then clears itself', () => {
    const player = document.getElementById('videoLightboxPlayer');
    player.play = jest.fn().mockReturnValue(Promise.resolve());
    player.pause = jest.fn();
    player.load = jest.fn();

    document.getElementById('videoWorkCard').click();

    // Trigger canplay
    const handler = player.oncanplay;
    handler();
    expect(player.play).toHaveBeenCalled();
    expect(player.oncanplay).toBeNull();
  });
});

describe('Video Lightbox - Closing', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildVideoDOM();
    loadMainJS();
    mockVideoMethods();
    document.getElementById('videoWorkCard').click();
  });
  afterEach(() => clearDOM());

  test('clicking close button closes the video lightbox', () => {
    document.querySelector('.video-lightbox__close').click();
    const vl = document.getElementById('videoLightbox');
    expect(vl.classList.contains('video-lightbox--open')).toBe(false);
  });

  test('closing restores body overflow', () => {
    document.querySelector('.video-lightbox__close').click();
    expect(document.body.style.overflow).toBe('');
  });

  test('closing pauses the player', () => {
    const player = document.getElementById('videoLightboxPlayer');
    player.pause = jest.fn();
    document.querySelector('.video-lightbox__close').click();
    expect(player.pause).toHaveBeenCalled();
  });

  test('closing removes the src attribute', () => {
    document.querySelector('.video-lightbox__close').click();
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.hasAttribute('src')).toBe(false);
  });

  test('pressing Escape closes the video lightbox', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const vl = document.getElementById('videoLightbox');
    expect(vl.classList.contains('video-lightbox--open')).toBe(false);
  });

  test('clicking backdrop closes the video lightbox', () => {
    const vl = document.getElementById('videoLightbox');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: vl });
    vl.dispatchEvent(event);
    expect(vl.classList.contains('video-lightbox--open')).toBe(false);
  });

  test('clicking inside content does NOT close', () => {
    const vl = document.getElementById('videoLightbox');
    const player = document.getElementById('videoLightboxPlayer');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: player });
    vl.dispatchEvent(event);
    expect(vl.classList.contains('video-lightbox--open')).toBe(true);
  });
});

describe('Video Lightbox - Navigation', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildVideoDOM();
    loadMainJS();
    mockVideoMethods();
    document.getElementById('videoWorkCard').click();
  });
  afterEach(() => clearDOM());

  test('clicking next goes to video 2', () => {
    document.querySelector('.video-lightbox__next').click();
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('C5n7zbHO5E0.mp4');
    const counter = document.getElementById('videoLightboxCounter');
    expect(counter.textContent).toBe('2 / 7');
  });

  test('clicking prev from first video wraps to last (video 7)', () => {
    document.querySelector('.video-lightbox__prev').click();
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('DTifcOsjjCz.mp4');
    const counter = document.getElementById('videoLightboxCounter');
    expect(counter.textContent).toBe('7 / 7');
  });

  test('clicking next 7 times wraps back to video 1', () => {
    const nextBtn = document.querySelector('.video-lightbox__next');
    for (let i = 0; i < 7; i++) nextBtn.click();
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('DI10aTBRffO.mp4');
    const counter = document.getElementById('videoLightboxCounter');
    expect(counter.textContent).toBe('1 / 7');
  });

  test('ArrowRight key advances to next video', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('C5n7zbHO5E0.mp4');
  });

  test('ArrowLeft key goes to previous video', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('DTifcOsjjCz.mp4');
  });

  test('keyboard does nothing when video lightbox is closed', () => {
    document.querySelector('.video-lightbox__close').click();
    const player = document.getElementById('videoLightboxPlayer');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    // src was removed on close, should remain absent
    expect(player.hasAttribute('src')).toBe(false);
  });
});

describe('Video Lightbox - Touch/Swipe', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    buildVideoDOM();
    loadMainJS();
    mockVideoMethods();
    document.getElementById('videoWorkCard').click();
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

  test('swiping left goes to next video', () => {
    const vl = document.getElementById('videoLightbox');
    simulateSwipe(vl, 300, 200);
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('C5n7zbHO5E0.mp4');
  });

  test('swiping right goes to previous video', () => {
    const vl = document.getElementById('videoLightbox');
    simulateSwipe(vl, 200, 300);
    const player = document.getElementById('videoLightboxPlayer');
    expect(player.src).toContain('DTifcOsjjCz.mp4');
  });

  test('small swipe does not navigate', () => {
    const vl = document.getElementById('videoLightbox');
    const player = document.getElementById('videoLightboxPlayer');
    const srcBefore = player.src;
    simulateSwipe(vl, 300, 270);
    expect(player.src).toBe(srcBefore);
  });
});

describe('Video Lightbox - Null safety', () => {
  afterEach(() => clearDOM());

  test('does not crash when videoWorkCard is missing', () => {
    mockIntersectionObserver();
    document.body.innerHTML = `
      <header class="navbar" id="navbar"></header>
      <div class="video-lightbox" id="videoLightbox">
        <button class="video-lightbox__close">&times;</button>
        <button class="video-lightbox__prev">&#8249;</button>
        <button class="video-lightbox__next">&#8250;</button>
        <div class="video-lightbox__content">
          <video class="video-lightbox__video" id="videoLightboxPlayer" muted></video>
        </div>
        <div class="video-lightbox__counter" id="videoLightboxCounter"></div>
      </div>
    `;
    expect(() => loadMainJS()).not.toThrow();
  });

  test('does not crash when videoLightbox is missing', () => {
    mockIntersectionObserver();
    document.body.innerHTML = `
      <header class="navbar" id="navbar"></header>
      <article id="videoWorkCard">
        <video src="test.mp4" muted></video>
      </article>
    `;
    const video = document.querySelector('#videoWorkCard video');
    video.play = jest.fn().mockReturnValue(Promise.resolve());
    video.pause = jest.fn();
    expect(() => loadMainJS()).not.toThrow();
  });

  test('does not crash when videoWorkCard has no video child', () => {
    mockIntersectionObserver();
    document.body.innerHTML = `
      <header class="navbar" id="navbar"></header>
      <article id="videoWorkCard"></article>
      <div class="video-lightbox" id="videoLightbox">
        <button class="video-lightbox__close">&times;</button>
        <button class="video-lightbox__prev">&#8249;</button>
        <button class="video-lightbox__next">&#8250;</button>
        <div class="video-lightbox__content">
          <video class="video-lightbox__video" id="videoLightboxPlayer" muted></video>
        </div>
        <div class="video-lightbox__counter" id="videoLightboxCounter"></div>
      </div>
    `;
    expect(() => loadMainJS()).not.toThrow();
  });
});
