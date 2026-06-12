# Critical Review

## The hard truth

Right now the idea is attractive, but bloated. You are describing a rendering engine, a market data service, a recommendation system, a metadata platform, and a social discovery product as if they are one MVP. They are not. If you build all of this at once, you will drown in integration work before you learn whether players trust the core try-on experience.

## The biggest risks, in order

### 1. Fidelity is the product

If the mannequin, materials, texture mapping, lighting, or layering look even slightly wrong, the whole product feels fake. Rust players will not trust purchase decisions based on a preview that feels "close enough." A sleek UI will not save inaccurate rendering.

### 2. Your current scope is undisciplined

Male and female models, real idle animations, held weapons, ADS preview, biomes, glow mode, live prices, AI tags, color search, artist search, collections, community loadouts, random kit generation, and Twitch drops is not a launch plan. It is a roadmap for multiple quarters.

### 3. Asset and legal reality can kill this early

You need a real answer for where models, textures, metadata, and market prices come from, what the usage rights are, and how stable those sources are. If the asset pipeline is shaky or the APIs are fragile, the product becomes a maintenance trap.

### 4. "Real-time" pricing is a trap word

Users want fresh enough prices, not a fragile live ticker that gets rate-limited or fails during traffic spikes. Steam and Skinport comparison is useful, but it belongs behind caching, snapshots, stale-state handling, and clear timestamps.

### 5. The Stealth Meter can become fake science

This feature sounds strong, but it is dangerously easy to make it meaningless. A palette-distance number is not the same thing as in-game stealth. If the score feels arbitrary, users will dismiss it as gimmick math.

### 6. Community loadouts are premature

Social discovery only works when there is already a reason to come back. If early users land on empty collections and dead community pages, it weakens the product instead of strengthening it.

### 7. AI vibe tags are garnish, not foundation

They look modern, but they will be noisy unless the underlying dataset is clean. Manual or rules-based tags will beat sloppy AI labels early on.

### 8. ADS preview is more expensive than it sounds

A credible iron-sight preview is not just another camera angle. It implies first-person model alignment, weapon-specific positioning, and extra validation work. That is a separate fidelity problem.

### 9. The wear slider is low-value and possibly misleading

You already noted that most Rust skins do not visually degrade in the way users might expect. That makes this feature expensive relative to its actual value.

### 10. Deep Sea as a core launch biome smells like roadmap cosplay

Building launch scope around a speculative or future-facing content update is weak prioritization. Solve the obvious environments first.

## What deserves focus instead

### Focus 1: Prove one trustworthy visual workflow

One mannequin, one high-quality pose, accurate layering, a small curated skin set, and a few believable biome presets is enough to learn whether the core experience has value.

### Focus 2: Turn the data model into a serious system

You need a clear item schema for slots, collections, artists, colors, emissive flags, source marketplace IDs, and pricing timestamps. Without this, discovery and utility features stay brittle.

### Focus 3: Make the Stealth Meter honest

Version the algorithm, explain the inputs, and present it as a heuristic instead of pretending it is objective truth.

### Focus 4: Choose one discovery surface

Collections are the strongest candidate because they are concrete and already legible to users. Community loadouts can come later, once people can actually make good ones.

### Focus 5: Stop treating everything as MVP

The product only needs one strong reason to exist at launch. Right now your draft has ten.
