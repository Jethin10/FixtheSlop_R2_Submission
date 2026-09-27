# Delulu3 — Fix the Slop

A static workspace demo with an animated landing page, order dashboard, journal, community and seven tools.

## Run locally

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

Open http://localhost:4174/. No build is required. Browser changes persist locally; contact forms save drafts and do not send messages. Currency rates are illustrative. Embedded videos depend on their original hosting provider.

## Checks

Install test dependencies with `npm ci`. Run `node tests/calculations.cjs`, or start the local server and use the browser checks in tests/.

## Assets

Photo credits are in assets/landing/SOURCES.json and assets/SOURCES.json. Font licensing is in assets/Geist-LICENSE.txt. The supplied landing layout and media source are documented in privy/SOURCE.md.
