'use strict';

(function initReviewDashboard(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ReviewDashboard = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createReviewDashboard() {
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function safeReviewUrl(value) {
    try {
      const url = new URL(String(value));
      if (
        url.protocol !== 'https:' ||
        url.hostname !== 'play.google.com' ||
        url.pathname !== '/store/apps/details'
      ) {
        return '#';
      }
      return url.href;
    } catch {
      return '#';
    }
  }

  function buildReviewCard(review, langNames = {}) {
    const numericScore = Number(review.score);
    const score = Number.isFinite(numericScore)
      ? Math.max(0, Math.min(5, Math.round(numericScore)))
      : 0;
    const stars = '★'.repeat(score) + '☆'.repeat(5 - score);
    const starsClass = score <= 2 ? 'low' : score === 3 ? 'medium' : '';
    const needsAttention = !review.replyText;
    const textClass = needsAttention ? 'needs-attention' : 'responded';
    const numericThumbs = Number(review.thumbsUp);
    const thumbsUp = Number.isFinite(numericThumbs) ? Math.max(0, numericThumbs) : 0;
    const thumbsClass = thumbsUp >= 2 ? 'high' : '';
    const parsedDate = new Date(review.date);
    const date = Number.isNaN(parsedDate.getTime()) ? 'Unknown date' : parsedDate.toLocaleDateString();
    const language = langNames[review.lang] || review.lang || '—';
    const reviewUrl = safeReviewUrl(review.url);

    return `
      <div class="review-card">
        <div class="review-header">
          <span class="review-user">${escapeHtml(review.userName || 'Anonymous')}</span>
          <div class="review-meta">
            <span class="stars ${starsClass}">${stars}</span>
            <span class="review-date">${escapeHtml(date)}</span>
            <span class="review-lang">${escapeHtml(language)}</span>
            ${review.version ? `<span class="review-version">v${escapeHtml(review.version)}</span>` : ''}
          </div>
        </div>
        <div class="review-text ${textClass}">${escapeHtml(review.text)}</div>
        ${review.replyText ? `
          <div class="reply-text">↳ Dev: ${escapeHtml(review.replyText)}</div>
        ` : ''}
        <div class="review-footer">
          <span class="thumbs-up ${thumbsClass}">👍 ${escapeHtml(thumbsUp)}</span>
          <div>
            ${needsAttention ? '<span class="reply-badge">Needs Reply</span>' : ''}
            <a href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener noreferrer" class="review-link">View on Play Store →</a>
          </div>
        </div>
      </div>
    `;
  }

  return { escapeHtml, safeReviewUrl, buildReviewCard };
});
