/**
 * Gallery Data Integrity Tests
 * Nick Long Sports Photography Website
 *
 * Tests cover:
 *   1. All expected galleries exist
 *   2. No galleries are empty
 *   3. All paths are valid format (images/...)
 *   4. No duplicate entries within a gallery
 *   5. All paths end with .jpg
 *   6. Video sources array integrity
 *   7. Gallery-to-HTML data-gallery attribute consistency
 */

const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'js', 'main.js');
const jsContent = fs.readFileSync(jsPath, 'utf-8');
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extract gallery names from JS
function extractGalleryNames() {
  const match = jsContent.match(/const galleries\s*=\s*\{([\s\S]*?)\n\};/);
  if (!match) return [];
  const keys = match[1].match(/^\s*(\w+)\s*:/gm);
  return keys ? keys.map(k => k.trim().replace(':', '')) : [];
}

// Extract image paths for a gallery
function extractGalleryPaths(name) {
  const regex = new RegExp(`${name}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = jsContent.match(regex);
  if (!match) return [];
  const paths = match[1].match(/'([^']+)'/g);
  return paths ? paths.map(p => p.replace(/'/g, '')) : [];
}

// Extract video sources array (only .mp4 src paths, not poster .jpg paths)
function extractVideoSources() {
  const match = jsContent.match(/const videoSources\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  const paths = match[1].match(/'([^']+\.mp4)'/g);
  return paths ? paths.map(p => p.replace(/'/g, '')) : [];
}

// Extract data-gallery values from HTML
function extractDataGalleryValues() {
  const matches = htmlContent.match(/data-gallery="(\w+)"/g);
  if (!matches) return [];
  return matches.map(m => m.match(/data-gallery="(\w+)"/)[1]);
}

describe('Gallery Data - Structure', () => {
  const galleryNames = extractGalleryNames();

  test('galleries object has at least 4 galleries', () => {
    expect(galleryNames.length).toBeGreaterThanOrEqual(4);
  });

  test('contains basketball gallery', () => {
    expect(galleryNames).toContain('basketball');
  });

  test('contains fnl gallery', () => {
    expect(galleryNames).toContain('fnl');
  });

  test('contains orangewhite gallery', () => {
    expect(galleryNames).toContain('orangewhite');
  });

  test('contains football gallery', () => {
    expect(galleryNames).toContain('football');
  });

  test('contains creative gallery', () => {
    expect(galleryNames).toContain('creative');
  });
});

describe('Gallery Data - No empty galleries', () => {
  const galleryNames = extractGalleryNames();

  galleryNames.forEach(name => {
    test(`${name} gallery is not empty`, () => {
      const paths = extractGalleryPaths(name);
      expect(paths.length).toBeGreaterThan(0);
    });
  });
});

describe('Gallery Data - Path format validation', () => {
  const galleryNames = extractGalleryNames();

  galleryNames.forEach(name => {
    test(`all ${name} paths start with "images/"`, () => {
      const paths = extractGalleryPaths(name);
      paths.forEach(p => {
        expect(p).toMatch(/^images\//);
      });
    });

    test(`all ${name} paths end with ".jpg"`, () => {
      const paths = extractGalleryPaths(name);
      paths.forEach(p => {
        expect(p).toMatch(/\.jpg$/);
      });
    });

    test(`no ${name} paths contain double slashes`, () => {
      const paths = extractGalleryPaths(name);
      paths.forEach(p => {
        expect(p).not.toContain('//');
      });
    });
  });
});

describe('Gallery Data - No duplicate entries', () => {
  const galleryNames = extractGalleryNames();

  galleryNames.forEach(name => {
    test(`${name} gallery has no duplicate paths`, () => {
      const paths = extractGalleryPaths(name);
      const unique = new Set(paths);
      expect(paths.length).toBe(unique.size);
    });
  });
});

describe('Gallery Data - Size expectations', () => {
  test('basketball gallery has a substantial number of images', () => {
    const paths = extractGalleryPaths('basketball');
    expect(paths.length).toBeGreaterThanOrEqual(20);
  });

  test('fnl gallery has images', () => {
    const paths = extractGalleryPaths('fnl');
    expect(paths.length).toBeGreaterThanOrEqual(9);
  });

  test('football gallery has images', () => {
    const paths = extractGalleryPaths('football');
    expect(paths.length).toBeGreaterThanOrEqual(10);
  });
});

describe('Video Sources - Integrity', () => {
  const videoSources = extractVideoSources();

  test('videoSources array has at least 4 videos', () => {
    expect(videoSources.length).toBeGreaterThanOrEqual(4);
  });

  test('all video paths start with "images/reels/"', () => {
    videoSources.forEach(src => {
      expect(src).toMatch(/^images\/reels\//);
    });
  });

  test('all video paths end with ".mp4"', () => {
    videoSources.forEach(src => {
      expect(src).toMatch(/\.mp4$/);
    });
  });

  test('no duplicate video sources', () => {
    const unique = new Set(videoSources);
    expect(videoSources.length).toBe(unique.size);
  });
});

describe('Gallery Data - HTML consistency', () => {
  const dataGalleryValues = extractDataGalleryValues();
  const galleryNames = extractGalleryNames();

  test('every data-gallery in HTML has a matching JS gallery', () => {
    dataGalleryValues.forEach(val => {
      expect(galleryNames).toContain(val);
    });
  });

  test('every JS gallery has at least one data-gallery card in HTML', () => {
    galleryNames.forEach(name => {
      expect(dataGalleryValues).toContain(name);
    });
  });
});

describe('Gallery Data - Image path consistency', () => {
  test('basketball images use the basketball/ subdirectory', () => {
    const paths = extractGalleryPaths('basketball');
    paths.forEach(p => {
      expect(p).toMatch(/^images\/basketball\//);
    });
  });

  test('fnl images use the fnl/ subdirectory', () => {
    const paths = extractGalleryPaths('fnl');
    paths.forEach(p => {
      expect(p).toMatch(/^images\/fnl\//);
    });
  });

  test('football images use the football/ subdirectory', () => {
    const paths = extractGalleryPaths('football');
    paths.forEach(p => {
      expect(p).toMatch(/^images\/football\//);
    });
  });

  test('orangewhite images use the selected/ subdirectory', () => {
    const paths = extractGalleryPaths('orangewhite');
    paths.forEach(p => {
      expect(p).toMatch(/^images\/selected\//);
    });
  });
});
