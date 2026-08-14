# Google Play Reviews Fetcher + Dashboard

Fetch Google Play reviews in multiple languages, deduplicate them, and inspect them locally in a small dashboard.

## Privacy

Review exports contain usernames, stable review IDs, timestamps, free-form text, developer replies, app versions, and direct links. Treat generated exports as private working data:

- `reviews.json` is ignored by Git and must not be committed or published.
- `reviews.example.json` contains fully synthetic demonstration data.
- Do not enable GitHub Pages with real review exports.
- Delete local exports when they are no longer needed.

## Setup

```bash
npm ci
```

## Fetch reviews

```bash
# Fetch reviews for the default app into the ignored reviews.json file
npm run fetch

# Fetch reviews for a specific app
node index.js com.example.app

# Specify another local output file
node index.js com.example.app reviews.local.json
```

The fetcher:

1. retrieves reviews for ten languages (`en`, `de`, `fr`, `es`, `it`, `ja`, `ko`, `zh`, `pt`, `ru`),
2. deduplicates them,
3. saves the result locally, and
4. prints summary statistics.

## Dashboard

After fetching, serve the repository locally and open the dashboard:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/dashboard.html`. The dashboard reads the ignored local `reviews.json` file. To preview the synthetic example instead, copy it locally first:

```bash
cp reviews.example.json reviews.json
```

Review content is treated as untrusted input. The dashboard escapes review text and only links to HTTPS Google Play review URLs.

## Output format

See `reviews.example.json` for the complete, fully synthetic schema. A review may contain:

- `id`
- `userName`
- `date`
- `score`
- `title`
- `text`
- `replyText` and `replyDate`
- `version`
- `thumbsUp`
- `lang`
- `url`

## Tests

```bash
npm test
```

## Note

This project uses the unofficial `google-play-scraper` package and may require changes if Google modifies its API. Before collecting or processing review data, check the applicable Google Play terms and your legal basis for doing so.
