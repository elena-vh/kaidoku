# Kaidoku

A spaced-repetition trainer for learning to read kanji. Components (radicals)
unlock characters, characters unlock the words that use them; reviews ask for the
English meaning, typed. Each item climbs an eight-rank ladder and the rank _is_
the review interval.

Client-side only — no server, no accounts. Progress lives in `localStorage`.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # tsc -b && vite build
```

## How it's built

The scheduling logic is a standalone, headless engine. It imports nothing from
React and never calls `Date.now()` — time is always passed in as a parameter — so
the whole thing is unit-tested in milliseconds and a 30-day interval doesn't take
30 days to verify.

```
src/
  engine/        pure SRS logic — no React, no clock, no I/O
    intervals    the 8-rank ladder (4h → 8h → 24h → 48h → 1w → 2w → 30d → sealed)
    schedule     nextStage(), schedule() — new Progress from an outcome
    judge        normalise / Levenshtein / judge() → right | near | wrong | empty
    queues       due queue, lesson queue, unlock + advancement rules
    clock        Clock interface: realClock, offsetClock
    storage      versioned load / save / migrate / export / import
  data/          kanji-data.js ported to a typed Item[] + an integrity check
  state/         one reducer + a context provider (persistence, 60s clock tick)
  screens/       Review, Lesson, Today, …
  lib/           display-only formatting helpers
```

Everything derived — the due queue, which words are unlocked, the leech list, rank
counts — is computed from `progress` on demand, never stored. Storing it would
create a second source of truth that drifts.

### Scheduling rules

```
correct:  stage → min(7, stage + 1)
wrong:    stage → max(0, stage − (stage >= 4 ? 2 : 1))
due    =  now + INTERVALS[stage]        // stage 7 never returns
```

A lapse from Adept or above drops **two** ranks, not one — an item you had a week
ago and still lost was never as solid as its rank claimed.

### Answer matching

Normalise (lowercase, strip punctuation, drop a leading `to`/`the`/`a`/`an`), then
accept an exact match against the primary meaning or any alternate, or a single
long word out of a multi-word meaning. An answer within one edit of an accepted
meaning returns `near` — "check your spelling", nothing recorded, try again — which
takes most of the friction out of a typed-answer SRS. Defeatable with strict mode.

## Data

Meanings, readings and stroke counts come from **KANJIDIC2** and **JMdict**
(Electronic Dictionary Research and Development Group, **CC BY-SA**), in the schema
served by [kanjiapi.dev](https://kanjiapi.dev). `kanji-data.js` is the source file;
`scripts/port-raw-data.mjs` ports it to `src/data/raw.ts`. The level order,
component groupings and mnemonics are original.

## Tests

```bash
npm test
npm run test:watch
```

The engine is tested hard, the UI lightly. `src/engine/longrun.test.ts` drives a
scripted 200-outcome sequence through `schedule()` and checks the result against
an independent reference; `src/screens/Review.test.tsx` runs a full review session
with the keyboard only.
