/**
 * HTML Structure Validation Tests
 * Nick Long Sports Photography Website
 *
 * These tests load the real index.html and verify structural correctness,
 * semantic HTML, accessibility attributes, and required meta tags.
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Parse into a DOM using jsdom (via Jest's test environment)
function loadHTML() {
  document.documentElement.innerHTML = '';
  document.write(htmlContent);
  document.close();
}

describe('HTML — Document head', () => {
  beforeAll(() => loadHTML());

  test('has a DOCTYPE declaration', () => {
    expect(htmlContent.trim().startsWith('<!DOCTYPE html>')).toBe(true);
  });

  test('html element has lang attribute', () => {
    const html = document.querySelector('html');
    expect(html.getAttribute('lang')).toBe('en');
  });

  test('has charset meta tag set to UTF-8', () => {
    const charset = document.querySelector('meta[charset]');
    expect(charset).not.toBeNull();
    expect(charset.getAttribute('charset').toUpperCase()).toBe('UTF-8');
  });

  test('has viewport meta tag', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute('content')).toContain('width=device-width');
  });

  test('has a title element', () => {
    const title = document.querySelector('title');
    expect(title).not.toBeNull();
    expect(title.textContent.trim().length).toBeGreaterThan(0);
  });

  test('has a meta description', () => {
    const desc = document.querySelector('meta[name="description"]');
    expect(desc).not.toBeNull();
    expect(desc.getAttribute('content').length).toBeGreaterThan(20);
  });

  test('has Open Graph meta tags', () => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogTitle).not.toBeNull();
    expect(ogDesc).not.toBeNull();
    expect(ogType).not.toBeNull();
    expect(ogImage).not.toBeNull();
  });

  test('has Twitter Card meta tags', () => {
    const twCard = document.querySelector('meta[name="twitter:card"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    expect(twCard).not.toBeNull();
    expect(twTitle).not.toBeNull();
  });

  test('has a favicon', () => {
    const favicon = document.querySelector('link[rel="icon"]');
    expect(favicon).not.toBeNull();
  });

  test('loads the stylesheet', () => {
    const css = document.querySelector('link[href="css/styles.css"]');
    expect(css).not.toBeNull();
    expect(css.getAttribute('rel')).toBe('stylesheet');
  });

  test('loads main.js with defer', () => {
    const script = document.querySelector('script[src="js/main.js"]');
    expect(script).not.toBeNull();
    expect(script.hasAttribute('defer')).toBe(true);
  });
});

describe('HTML — Navigation structure', () => {
  beforeAll(() => loadHTML());

  test('has a header with id="navbar"', () => {
    const navbar = document.getElementById('navbar');
    expect(navbar).not.toBeNull();
    expect(navbar.tagName).toBe('HEADER');
  });

  test('has a nav element with id="navMenu"', () => {
    const navMenu = document.getElementById('navMenu');
    expect(navMenu).not.toBeNull();
    expect(navMenu.tagName).toBe('NAV');
  });

  test('nav menu contains at least 5 links', () => {
    const links = document.querySelectorAll('#navMenu a');
    expect(links.length).toBeGreaterThanOrEqual(5);
  });

  test('nav toggle button has aria-label', () => {
    const toggle = document.getElementById('navToggle');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-label')).toBeTruthy();
  });

  test('internal nav links have valid hash references', () => {
    const links = document.querySelectorAll('#navMenu a:not([target="_blank"])');
    links.forEach(link => {
      const href = link.getAttribute('href');
      expect(href).toMatch(/^#\w+/);
      // Verify the target section exists
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      expect(target).not.toBeNull();
    });
  });
});

describe('HTML — Sections exist', () => {
  beforeAll(() => loadHTML());

  test('has hero section with id="home"', () => {
    expect(document.getElementById('home')).not.toBeNull();
  });

  test('has portfolio section with id="portfolio"', () => {
    expect(document.getElementById('portfolio')).not.toBeNull();
  });

  test('has reels section with id="reels"', () => {
    expect(document.getElementById('reels')).not.toBeNull();
  });

  test('has about section with id="about"', () => {
    expect(document.getElementById('about')).not.toBeNull();
  });

  test('has services section with id="services"', () => {
    expect(document.getElementById('services')).not.toBeNull();
  });

  test('has contact section with id="contact"', () => {
    expect(document.getElementById('contact')).not.toBeNull();
  });

  test('has a footer element', () => {
    expect(document.querySelector('footer')).not.toBeNull();
  });
});

describe('HTML — Semantic structure', () => {
  beforeAll(() => loadHTML());

  test('uses <header> for navigation', () => {
    expect(document.querySelector('header.navbar')).not.toBeNull();
  });

  test('uses <nav> for navigation menu', () => {
    expect(document.querySelector('nav.navbar__menu')).not.toBeNull();
  });

  test('uses <section> for content areas', () => {
    const sections = document.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(5);
  });

  test('uses <article> for portfolio cards', () => {
    const articles = document.querySelectorAll('article.portfolio__card');
    expect(articles.length).toBeGreaterThanOrEqual(1);
  });

  test('uses <footer> for the footer', () => {
    expect(document.querySelector('footer.footer')).not.toBeNull();
  });

  test('has exactly one <h1> element', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });
});

describe('HTML — Images and media', () => {
  beforeAll(() => loadHTML());

  test('hero image has alt text', () => {
    const heroImg = document.querySelector('.hero__bg-img');
    expect(heroImg).not.toBeNull();
    expect(heroImg.getAttribute('alt')).toBeTruthy();
  });

  test('hero image has explicit width and height attributes', () => {
    const heroImg = document.querySelector('.hero__bg-img');
    expect(heroImg.getAttribute('width')).toBeTruthy();
    expect(heroImg.getAttribute('height')).toBeTruthy();
  });

  test('hero image has fetchpriority="high"', () => {
    const heroImg = document.querySelector('.hero__bg-img');
    expect(heroImg.getAttribute('fetchpriority')).toBe('high');
  });

  test('portfolio images have alt text', () => {
    const imgs = document.querySelectorAll('.portfolio__card-image > img');
    imgs.forEach(img => {
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });

  test('portfolio images have loading="lazy"', () => {
    const imgs = document.querySelectorAll('.portfolio__card-image > img');
    imgs.forEach(img => {
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  test('reel videos have aria-label or aria-labelledby', () => {
    const videos = document.querySelectorAll('.reels-marquee__item video');
    videos.forEach(video => {
      const hasLabel = video.getAttribute('aria-label') || video.getAttribute('aria-labelledby');
      expect(hasLabel).toBeTruthy();
    });
  });

  test('reel videos have muted attribute', () => {
    const videos = document.querySelectorAll('.reels-marquee__item video');
    videos.forEach(video => {
      expect(video.hasAttribute('muted')).toBe(true);
    });
  });

  test('marquee duplicate items have aria-hidden="true"', () => {
    const duplicates = document.querySelectorAll('.marquee__item[aria-hidden="true"]');
    expect(duplicates.length).toBeGreaterThan(0);
  });
});

describe('HTML — Contact form', () => {
  beforeAll(() => loadHTML());

  test('form has action and method attributes', () => {
    const form = document.querySelector('.contact__form');
    expect(form).not.toBeNull();
    expect(form.getAttribute('action')).toBeTruthy();
    expect(form.getAttribute('method')).toBe('POST');
  });

  test('form has required name input', () => {
    const nameInput = document.querySelector('.contact__form input[name="name"]');
    expect(nameInput).not.toBeNull();
    expect(nameInput.hasAttribute('required')).toBe(true);
  });

  test('form has required email input with type="email"', () => {
    const emailInput = document.querySelector('.contact__form input[name="email"]');
    expect(emailInput).not.toBeNull();
    expect(emailInput.getAttribute('type')).toBe('email');
    expect(emailInput.hasAttribute('required')).toBe(true);
  });

  test('form has required message textarea', () => {
    const textarea = document.querySelector('.contact__form textarea[name="message"]');
    expect(textarea).not.toBeNull();
    expect(textarea.hasAttribute('required')).toBe(true);
  });

  test('form has a submit button', () => {
    const btn = document.querySelector('.contact__form button[type="submit"]');
    expect(btn).not.toBeNull();
  });
});

describe('HTML — Accessibility', () => {
  beforeAll(() => loadHTML());

  test('all external links have rel="noopener noreferrer"', () => {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
      const rel = link.getAttribute('rel') || '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  test('social icon links have aria-label', () => {
    const socialLinks = document.querySelectorAll('.contact__socials a');
    socialLinks.forEach(link => {
      expect(link.getAttribute('aria-label')).toBeTruthy();
    });
  });

  test('navbar logo has alt text on image', () => {
    const logoImg = document.querySelector('.navbar__logo img');
    expect(logoImg).not.toBeNull();
    expect(logoImg.getAttribute('alt')).toBeTruthy();
  });
});
