'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');

test('review renderer escapes untrusted review content and blocks unsafe links', () => {
  const { buildReviewCard } = require('../dashboard.js');
  const malicious = {
    userName: '<img src=x onerror="globalThis.pwned=true">',
    date: '2026-01-01T00:00:00.000Z',
    score: 1,
    text: '<script>globalThis.pwned=true</script>',
    replyText: '<svg onload=globalThis.pwned=true>',
    version: '"><img src=x onerror=alert(1)>',
    thumbsUp: 2,
    lang: '<img src=x onerror=alert(1)>',
    url: 'javascript:alert(document.domain)'
  };

  const html = buildReviewCard(malicious, {});

  assert.doesNotMatch(html, /<(?:script|img|svg)\b/i);
  assert.doesNotMatch(html, /href="javascript:/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /href="#"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('review renderer preserves valid Google Play review links', () => {
  const { buildReviewCard } = require('../dashboard.js');
  const url = 'https://play.google.com/store/apps/details?id=com.example.app&reviewId=synthetic-review-001';
  const html = buildReviewCard({
    userName: 'Example Reviewer',
    date: '2026-01-01T00:00:00.000Z',
    score: 5,
    text: 'Synthetic example',
    replyText: null,
    version: '1.0.0',
    thumbsUp: 0,
    lang: 'en',
    url
  }, { en: 'EN' });

  assert.match(html, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.example\.app&amp;reviewId=synthetic-review-001/);
});

test('generated review exports and dependencies are not tracked', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' })
    .trim()
    .split('\n');
  const gitignore = fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');

  assert.equal(tracked.includes('reviews.json'), false);
  assert.equal(tracked.some(file => file === 'node_modules' || file.startsWith('node_modules/')), false);
  assert.match(gitignore, /^reviews\.json$/m);
  assert.match(gitignore, /^node_modules\/$/m);
});
