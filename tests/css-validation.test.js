/**
 * CSS Validation Tests
 * Nick Long Sports Photography Website
 *
 * Checks for structural correctness, required declarations,
 * and common CSS issues in styles.css.
 */

const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

describe('CSS — File basics', () => {
  test('styles.css file exists and is not empty', () => {
    expect(cssContent.length).toBeGreaterThan(0);
  });

  test('file is a reasonable size (> 1KB)', () => {
    expect(cssContent.length).toBeGreaterThan(1000);
  });
});

describe('CSS — Syntax checks', () => {
  test('all opening braces have matching closing braces', () => {
    // Strip comments and strings to avoid false positives
    const stripped = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
    const opens = (stripped.match(/\{/g) || []).length;
    const closes = (stripped.match(/\}/g) || []).length;
    expect(opens).toBe(closes);
  });

  test('no empty rulesets (empty braces)', () => {
    const stripped = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
    // Match { followed by only whitespace then }
    const emptyRules = stripped.match(/\{\s*\}/g);
    expect(emptyRules).toBeNull();
  });

  test('no duplicate semicolons (;;)', () => {
    const stripped = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(stripped).not.toContain(';;');
  });
});

describe('CSS — Custom properties (design tokens)', () => {
  test('defines :root with custom properties', () => {
    expect(cssContent).toContain(':root');
    expect(cssContent).toContain('--color-bg-primary');
    expect(cssContent).toContain('--color-text-primary');
  });

  test('defines font custom properties', () => {
    expect(cssContent).toContain('--font-heading');
    expect(cssContent).toContain('--font-body');
  });

  test('defines spacing custom properties', () => {
    expect(cssContent).toContain('--space-xs');
    expect(cssContent).toContain('--space-sm');
    expect(cssContent).toContain('--space-md');
    expect(cssContent).toContain('--space-lg');
    expect(cssContent).toContain('--space-xl');
  });

  test('defines transition custom properties', () => {
    expect(cssContent).toContain('--transition-fast');
    expect(cssContent).toContain('--transition-base');
    expect(cssContent).toContain('--transition-slow');
  });
});

describe('CSS — Reset styles', () => {
  test('has box-sizing: border-box reset', () => {
    expect(cssContent).toContain('box-sizing: border-box');
  });

  test('resets margin and padding', () => {
    expect(cssContent).toContain('margin: 0');
    expect(cssContent).toContain('padding: 0');
  });

  test('has smooth scrolling on html', () => {
    expect(cssContent).toContain('scroll-behavior: smooth');
  });
});

describe('CSS — Key component styles', () => {
  test('navbar is position: fixed', () => {
    expect(cssContent).toContain('position: fixed');
  });

  test('navbar has z-index', () => {
    expect(cssContent).toMatch(/z-index:\s*1000/);
  });

  test('navbar--scrolled class is defined', () => {
    expect(cssContent).toContain('.navbar--scrolled');
  });

  test('navbar__menu--open class is defined', () => {
    expect(cssContent).toContain('.navbar__menu--open');
  });

  test('navbar__toggle--active class is defined', () => {
    expect(cssContent).toContain('.navbar__toggle--active');
  });

  test('hero section has min-height: 100vh', () => {
    expect(cssContent).toContain('min-height: 100vh');
  });

  test('animate-on-scroll class is defined', () => {
    expect(cssContent).toContain('.animate-on-scroll');
  });

  test('animate--visible class is defined', () => {
    expect(cssContent).toContain('.animate--visible');
  });

  test('animate-on-load class is defined', () => {
    expect(cssContent).toContain('.animate-on-load');
  });
});

describe('CSS — Responsive design', () => {
  test('has tablet breakpoint media query', () => {
    expect(cssContent).toMatch(/@media\s*\(max-width:\s*991px\)/);
  });

  test('has mobile breakpoint media query', () => {
    expect(cssContent).toMatch(/@media\s*\(max-width:\s*767px\)/);
  });

  test('has small mobile breakpoint media query', () => {
    expect(cssContent).toMatch(/@media\s*\(max-width:\s*479px\)/);
  });

  test('uses fluid typography with clamp()', () => {
    const clampCount = (cssContent.match(/clamp\(/g) || []).length;
    expect(clampCount).toBeGreaterThanOrEqual(5);
  });
});

describe('CSS — Accessibility', () => {
  test('has prefers-reduced-motion media query', () => {
    expect(cssContent).toContain('prefers-reduced-motion');
  });

  test('reduced-motion disables animations', () => {
    // Check that animation-duration is set to near-zero
    expect(cssContent).toMatch(/animation-duration:\s*0\.01ms/);
  });

  test('has focus-visible styles', () => {
    expect(cssContent).toContain('focus-visible');
  });

  test('focus-visible has outline style', () => {
    expect(cssContent).toContain('outline:');
    expect(cssContent).toContain('outline-offset:');
  });

  test('reduced-motion resets animate-on-scroll to visible', () => {
    // Within the reduced motion block, animate-on-scroll should show
    const reducedMotionBlock = cssContent.substring(
      cssContent.indexOf('prefers-reduced-motion')
    );
    expect(reducedMotionBlock).toContain('.animate-on-scroll');
    expect(reducedMotionBlock).toContain('opacity: 1');
  });
});

describe('CSS — Animation keyframes', () => {
  test('defines fadeUp keyframes', () => {
    expect(cssContent).toContain('@keyframes fadeUp');
  });

  test('defines marquee-scroll keyframes', () => {
    expect(cssContent).toContain('@keyframes marquee-scroll');
  });

  test('defines reels-scroll keyframes', () => {
    expect(cssContent).toContain('@keyframes reels-scroll');
  });

  test('marquee uses will-change: transform for performance', () => {
    expect(cssContent).toContain('will-change: transform');
  });
});

describe('CSS — No common mistakes', () => {
  test('does not use !important excessively (max 5 occurrences)', () => {
    const importantCount = (cssContent.match(/!important/g) || []).length;
    // A few !important in reduced-motion is acceptable
    expect(importantCount).toBeLessThanOrEqual(5);
  });

  test('does not contain TODO or FIXME comments', () => {
    expect(cssContent.toUpperCase()).not.toContain('TODO');
    expect(cssContent.toUpperCase()).not.toContain('FIXME');
  });

  test('uses overflow-x: hidden on body to prevent horizontal scroll', () => {
    expect(cssContent).toContain('overflow-x: hidden');
  });
});
