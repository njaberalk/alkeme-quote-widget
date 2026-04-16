# Insurance Quote Form

A multi-step insurance quote form built with Next.js. Submissions are sent to Customer.io for lead tracking.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your Customer.io credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
CUSTOMERIO_SITE_ID=your_site_id_here
CUSTOMERIO_API_KEY=your_api_key_here
```

You can find these in your Customer.io account under **Settings > Account Settings > API Credentials**. Use the **Track API** Site ID and API Key.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the form.

### 4. Build for production

```bash
npm run build
npm start
```

## Deployment

This is a standard Next.js app. It can be deployed anywhere that supports Node.js:

### Vercel (easiest)

1. Push the repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add the two environment variables (`CUSTOMERIO_SITE_ID`, `CUSTOMERIO_API_KEY`) in the Vercel project settings under **Settings > Environment Variables**
4. Deploy

### Other platforms (Netlify, Railway, AWS, any Node server)

Any platform that can run `npm run build` and `npm start` will work. Just make sure:

- **Node.js 18+** is available
- The two environment variables are set in the platform's config
- Port is configurable via the `PORT` env var (Next.js respects this automatically)

For a plain server:

```bash
npm install
npm run build
PORT=3000 npm start
```

## Embeddable Widget

The form is also available as a standalone widget that can be embedded on any website (e.g., Webflow, WordPress).

### Build the widgets

```bash
npm run build:widget
```

This builds both embeddable widgets and outputs four files into `dist-widget/`:
- `insurance-form.js` / `insurance-form.css` — multi-step quote form
- `valuation-calculator.js` / `valuation-calculator.css` — agency valuation calculator

To build only one:

```bash
npm run build:widget:insurance
npm run build:widget:valuation
```

### Embed the insurance quote form

```html
<link rel="stylesheet" href="insurance-form.css" />
<div id="insurance-form" data-api-url="https://YOUR-DOMAIN.com/api/submit"></div>
<script src="insurance-form.js"></script>
```

### Embed the agency valuation calculator

For the `alkemeins.com/what-is-my-agency-worth` page:

```html
<link rel="stylesheet" href="valuation-calculator.css" />
<div id="alkeme-valuation" data-api-url="https://YOUR-DOMAIN.com/api/valuation"></div>
<script src="valuation-calculator.js"></script>
```

The calculator walks the user through 6 steps (revenue → CAGR → line of business → EBITDA margin → state & headcount → contact) and submits everything to `/api/valuation`. The server computes the base valuation using a verified EBITDA multiples lookup, stores the lead in Customer.io, and fires a `valuation_requested` event. **The valuation is not shown on screen** — it's emailed to the user (email delivery is wired to trigger off the CIO event).

Replace `YOUR-DOMAIN.com` with wherever the Next.js app is hosted. The widget calls that URL to submit; all secrets live server-side.

**Important:** `data-api-url` must point to the deployed Next.js app's corresponding endpoint (`/api/submit` or `/api/valuation`). The widget bundles are static JS/CSS and hold no secrets.

## Project Structure

```
src/
  app/
    page.tsx                  # Full-page insurance quote form
    valuation/page.tsx        # Standalone valuation calculator page
    api/submit/               # Insurance form submit endpoint
    api/valuation/            # Valuation calculator submit endpoint
    globals.css
  widget/
    InsuranceForm.tsx         # Insurance quote widget
    ValuationCalculator.tsx   # Agency valuation widget
    valuation/
      multiples-table.ts      # EBITDA multiples lookup + compute logic
    widget.css                # Shared widget styles (.ifw- prefix)
    index.tsx                 # Insurance widget entry
    valuation-index.tsx       # Valuation widget entry
```

## Environment Variables

| Variable | Description |
|---|---|
| `CUSTOMERIO_SITE_ID` | Customer.io Track API Site ID |
| `CUSTOMERIO_API_KEY` | Customer.io Track API Key |
