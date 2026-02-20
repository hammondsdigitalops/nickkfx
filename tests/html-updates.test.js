/**
 * HTML Updates Validation Tests
 * Nick Long Sports Photography Website
 *
 * Tests for the code review fixes:
 *   1. Content Security Policy meta tag
 *   2. Absolute OG/Twitter image URLs
 *   3. Video card has no autoplay attribute
 *   4. About image has correct dimensions
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

function loadHTML() {
  document.documentElement.innerHTML = '';
  document.write(htmlContent);
  document.close();
}

describe('HTML — Content Security Policy', () => {
  beforeAll(() => loadHTML());

  test('has a Content-Security-Policy meta tag', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(csp).not.toBeNull();
  });

  test('CSP includes default-src directive', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(csp.getAttribute('content')).toContain("default-src 'self'");
  });

  test('CSP allows Google Fonts in style-src', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = csp.getAttribute('content');
    expect(content).toContain('https://fonts.googleapis.com');
  });

  test('CSP allows Google Fonts in font-src', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = csp.getAttribute('content');
    expect(content).toContain('fonts.gstatic.com');
  });

  test('CSP allows cdnjs for Font Awesome', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = csp.getAttribute('content');
    expect(content).toContain('cdnjs.cloudflare.com');
  });

  test('CSP allows formsubmit.co in connect-src and form-action', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = csp.getAttribute('content');
    expect(content).toContain('connect-src');
    expect(content).toContain('form-action');
    expect(content).toContain('formsubmit.co');
  });

  test('CSP restricts script-src to self only', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = csp.getAttribute('content');
    expect(content).toContain("script-src 'self'");
  });
});

describe('HTML — Absolute OG/Twitter URLs', () => {
  beforeAll(() => loadHTML());

  test('og:image uses absolute URL', () => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).not.toBeNull();
    const content = ogImage.getAttribute('content');
    expect(content).toMatch(/^https?:\/\//);
  });

  test('og:image points to the correct domain', () => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage.getAttribute('content')).toContain('hammondsdigitalops.github.io');
  });

  test('twitter:image uses absolute URL', () => {
    const twImage = document.querySelector('meta[name="twitter:image"]');
    expect(twImage).not.toBeNull();
    const content = twImage.getAttribute('content');
    expect(content).toMatch(/^https?:\/\//);
  });

  test('twitter:image points to the correct domain', () => {
    const twImage = document.querySelector('meta[name="twitter:image"]');
    expect(twImage.getAttribute('content')).toContain('hammondsdigitalops.github.io');
  });

  test('og:image and twitter:image reference the same file', () => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twImage = document.querySelector('meta[name="twitter:image"]');
    expect(ogImage.getAttribute('content')).toBe(twImage.getAttribute('content'));
  });
});

describe('HTML — Video card (no autoplay)', () => {
  beforeAll(() => loadHTML());

  test('video work card video does NOT have autoplay attribute', () => {
    const videoCard = document.getElementById('videoWorkCard');
    expect(videoCard).not.toBeNull();
    const video = videoCard.querySelector('video');
    expect(video).not.toBeNull();
    expect(video.hasAttribute('autoplay')).toBe(false);
  });

  test('video work card video still has preload="metadata"', () => {
    const video = document.querySelector('#videoWorkCard video');
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  test('video work card video still has muted attribute', () => {
    const video = document.querySelector('#videoWorkCard video');
    expect(video.hasAttribute('muted')).toBe(true);
  });

  test('video work card video has a poster image', () => {
    const video = document.querySelector('#videoWorkCard video');
    expect(video.getAttribute('poster')).toBeTruthy();
  });
});

describe('HTML — About image dimensions', () => {
  beforeAll(() => loadHTML());

  test('about section image has updated width attribute', () => {
    const aboutImg = document.querySelector('.about__image img');
    expect(aboutImg).not.toBeNull();
    const width = parseInt(aboutImg.getAttribute('width'), 10);
    expect(width).toBe(1200);
  });

  test('about section image has updated height attribute', () => {
    const aboutImg = document.querySelector('.about__image img');
    const height = parseInt(aboutImg.getAttribute('height'), 10);
    expect(height).toBe(1500);
  });
});
