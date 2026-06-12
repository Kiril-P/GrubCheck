# Source Prompt

Captured on 2026-03-19 as the initial GrubCheck project brief.

## Project

I am building GrubCheck, a high-fidelity 3D skin compositor for the game Rust. The site must allow users to search a database of skins, apply them to a 3D character mannequin using Three.js, and visualize them in various environmental lighting conditions (Biomes). Key technical requirements include real-time price fetching from Steam/Skinport APIs, a "Stealth Meter" algorithm that compares texture palettes against biome colors, and a "Glow-Check" night mode. The UI should be sleek, focusing on "Collections" and "Community Loadouts" to drive user discovery.

## 1. 3D Visualization Engine

- [ ] Full 3D Dummy: Male/Female models with real Rust idle animations.
- [ ] Layering Logic: Automatic stacking (Underwear -> Hoodie -> Vest -> Jacket).
- [ ] Weapon Equipping: Toggle "Held" view for any weapon skin to check for color clashing with sleeves.
- [ ] Biome Lighting: Forest, Desert, Arctic, and Deep Sea (for the 2026 Naval update skins).
- [ ] Glow Toggle: A "Midnight" button to show emissive textures (vital for No Mercy or Neon items).

## 2. Search & Discovery

- [ ] Collection Search: Filter by sets (Temple, Training, Blackout).
- [ ] Artist Portfolios: Search by the creator (e.g., hJune, Milshak) to keep styles consistent.
- [ ] "Vibe" Tags: AI-generated tags like "Tactical," "Flashy," "Camo," or "Meme."
- [ ] Color Picker: Find every skin that contains a specific hex code (e.g., "Find me all #FF69B4 pink skins").

## 3. Advanced Utility (The "Pro" Features)

- [ ] Stealth Meter: A percentage score of how well you blend into the selected biome.
- [ ] Price Optimizer: Live comparison between Steam and Skinport.
- [ ] Iron Sight Preview: (New Idea!) A small window showing the "ADS" (Aim Down Sights) view. Some skins have better sights than others (like the Glory AK).
- [ ] Wear/Condition Slider: Simulate what the skin looks like if it were a low-quality drop (though most Rust skins don't degrade visually, some "Battle Scarred" looks are popular).

## The "Secret Sauce" (Extra Ideas)

### A. The "Randomize My Drip" Button

A button that creates a perfectly color-coordinated kit from random items under a specific budget.

User sets budget to EUR15 -> AI builds a matching green kit they have never seen before.

### B. Twitch Drop Tracker

Integrate a section that shows current active Twitch Drops and lets you "Try them on" before you spend hours watching a stream to earn them.
