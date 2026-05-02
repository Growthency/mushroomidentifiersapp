# 🍄 MushroomIdentifiers — Mobile App

React Native + Expo mobile app for the existing **[mushroomidentifiers.com](https://mushroomidentifiers.com)** platform. Same Supabase backend, same user accounts, same credit system — but with native camera, location, and offline support.

---

## What's inside

### Core features (parity with competitor apps)

- 📸 **Multi-angle AI scan** — capture cap, underside, stem, base, habitat → Claude vision returns structured ID
- 📚 **10,000+ species library** — local Supabase + iNaturalist fallback search
- 📓 **Field journal** — every scan saved with habitat, location, weather snapshot
- 🗺️ **Foraging map** — pin finds, see crowd-sourced sightings
- ⚠️ **Toxicity & lookalike alerts** — explicit dangerous-twin warnings on every result
- 📞 **Emergency poison-control** — country-aware hotlines, one-tap dial

### 10× features above competitors

| #  | Feature                             | Why it wins |
|----|-------------------------------------|-------------|
| 1  | Multi-angle structured photo flow   | Mirrors expert methodology, beats single-photo apps |
| 2  | Streaming AI mycologist chat        | Follow-up questions on every scan |
| 3  | Weather-driven foraging score       | Rain + temp + humidity → "today's chance of fruiting" |
| 4  | Spore print walkthrough tool        | Lab-grade test in your pocket |
| 5  | PDF identification reports          | Shareable with experts/clubs |
| 6  | CSV journal export                  | For researchers / serious foragers |
| 7  | Region-specific species ranking     | iNaturalist regional observation count weighting |
| 8  | Achievements & gamification         | 10 starter badges, more shippable |
| 9  | Offline-first journal & library     | Works in the woods |
| 10 | Universal links from web → app      | One-click handoff from mushroomidentifiers.com |
| 11 | Voice-guided ID flow                | Hands-free in the field |
| 12 | Live camera detection (gated flag)  | Real-time bounding-box hints |
| 13 | Community find-sharing & expert verification | Crowd-sourced second opinions |
| 14 | Recipe library for confirmed edibles | Linked to scans, with safety re-prompts |
| 15 | Multi-language (12 langs incl. বাংলা, हिन्दी) | Underserved markets |

---

## 🚀 Setup

### 1. Install dependencies

```bash
bun install      # or: npm install / pnpm install / yarn
```

### 2. Configure environment variables

Copy `.env.example` → `.env` and fill in real values. Each block in `.env` has detailed notes on **where to get the key** — Supabase, Anthropic, RevenueCat, Google Maps, OpenWeather, Sentry, PostHog.

```bash
cp .env.example .env
```

> ⚠️ `.env` is gitignored. For production, add the same vars to **Vercel** (web routes) and **EAS Secrets** (mobile build):
> ```bash
> eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "..."
> ```

### 3. Set up the Supabase backend

The mobile app **shares the same Supabase project** as your website.

```bash
# in mushroomidentifiers.com repo OR a new project:
supabase link --project-ref <ref>
supabase db push --include-all   # applies migrations from /supabase/migrations
supabase functions deploy identify-mushroom
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

The migration is **additive** — uses `IF NOT EXISTS` everywhere so it won't break tables your web app already created.

### 4. Set up RevenueCat

1. Create project on https://app.revenuecat.com
2. Add iOS + Android apps with bundle id `com.mushroomidentifiers.app`
3. Create products in App Store Connect / Google Play Console:
   - `mushroomid_starter_monthly`  ($4.99)
   - `mushroomid_explorer_monthly` ($9.99)
   - `mushroomid_pro_monthly`      ($19.99)
4. Map them to entitlement `premium` and offering `default`
5. Paste API keys into `.env` (`EXPO_PUBLIC_REVENUECAT_API_KEY_IOS/ANDROID`)
6. Set up RevenueCat → Supabase webhook to call `grant_monthly_credits` on renewal.

### 5. Run the app

```bash
# pre-flight (creates ios/ and android/ from app.json)
bunx expo prebuild --clean

# start dev server
bun run start

# native dev builds (need Xcode / Android Studio)
bun run ios
bun run android
```

For physical devices: install **Expo Go** OR build a dev client:
```bash
eas build --profile development --platform ios
```

---

## 📁 Project structure

```
MushroomID/
├── .env                           # Gitignored — your local secrets
├── .env.example                   # Template with comments
├── app/                           # Expo Router file-based routing
│   ├── _layout.tsx                # Root: providers, splash, theme
│   ├── index.tsx                  # Auth gate / redirect
│   ├── (auth)/                    # Welcome / login / signup
│   ├── (tabs)/                    # Bottom-tab nav (home, library, identify, journal, profile)
│   ├── scan/                      # Capture → review → result modal flow
│   ├── mushroom/[id].tsx          # Encyclopedia detail
│   ├── journal/[id].tsx           # Journal entry detail
│   ├── chat.tsx                   # Streaming AI mycologist
│   ├── paywall.tsx                # RevenueCat tiers
│   ├── emergency.tsx              # Poison-control hotlines
│   ├── achievements.tsx           # Gamification
│   ├── map.tsx                    # Foraging map
│   ├── help.tsx                   # FAQ
│   └── settings/                  # Notifications / language / general
├── components/ui/                 # Button, Input, Card, Badge, Screen
├── lib/
│   ├── config.ts                  # Centralized env loader
│   ├── supabase.ts                # Auth + DB client
│   ├── anthropic.ts               # Vision-based ID + streaming chat
│   ├── revenuecat.ts              # Subscription wrapper
│   ├── credits.ts                 # 10-credits-per-ID accounting
│   ├── inaturalist.ts             # Free species DB fallback
│   ├── weather.ts                 # OpenWeather → foraging score
│   ├── storage.ts                 # Supabase Storage uploads
│   └── utils.ts                   # cn(), formatters, edibility helpers
├── stores/                        # Zustand: auth, scan, subscription
├── hooks/                         # useCredits, useColorScheme
├── types/                         # Domain types + Supabase generated types
├── constants/theme.ts             # Color palette
├── supabase/
│   ├── migrations/20260502000000_init.sql   # Schema, RLS, triggers, RPCs
│   └── functions/identify-mushroom/index.ts # Edge function (key stays server-side)
├── app.json                       # Expo config (permissions, deep links)
├── eas.json                       # Build profiles
├── tailwind.config.js             # NativeWind theme
└── tsconfig.json                  # Path aliases (@/lib, @/components…)
```

---

## 🔑 Where do my keys go?

### Local development — **`.env`**
Each section in `.env` has the exact URL and steps for getting that key. Open `.env` directly to see them.

### Production deployment

| Service              | Where to set                                              |
|----------------------|-----------------------------------------------------------|
| Mobile build         | EAS secrets: `eas secret:create --name EXPO_PUBLIC_X`     |
| Vercel (web routes)  | Vercel dashboard → Project → Settings → Environment       |
| Edge functions       | `supabase secrets set ANTHROPIC_API_KEY=...`              |
| RevenueCat → Supabase webhook | RevenueCat dashboard → Integrations → Webhooks   |

Server-only keys (Anthropic API key, Supabase service role) — **never** put in `EXPO_PUBLIC_*`. Use the Edge Function path in `lib/anthropic.ts`.

---

## 🛡️ Security checklist before launch

- [ ] Replace direct Anthropic calls with Edge Function (set `useDirect: false` in `identifyMushroom`)
- [ ] Rotate any `EXPO_PUBLIC_ANTHROPIC_API_KEY` you used during dev
- [ ] Verify RLS policies in `supabase/migrations/20260502000000_init.sql`
- [ ] Set `usesNonExemptEncryption: false` correctly per export-compliance rules
- [ ] Configure App Privacy in App Store Connect
- [ ] Set up Sentry DSN to catch crashes
- [ ] Enable App Check / Play Integrity for additional API gating

---

## 📜 Disclaimer

**This app is informational. Never consume a wild mushroom based solely on an app identification.** Always confirm with a qualified local mycologist or experienced forager. The AI is wrong sometimes; toxic lookalikes are very real.
