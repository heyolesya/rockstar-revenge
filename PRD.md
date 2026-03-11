# PRD: Kip Winger — Rockstar Revenge Arcade Game

## Overview

A browser-based retro arcade game promoting the Kip Winger documentary. Players control an 80s rock star (based on Kip Winger) through three levels that mirror his real career arc: the glamour of hair metal, the rivalry with Metallica, and the grunge era that nearly destroyed him.

**Style Reference:** Teenage Mutant Ninja Turtles arcade (Konami, 1989) — pixel art, bold colors, side-scrolling action, chunky sprites, CRT-style aesthetic.

**Platform:** Responsive HTML5 web game (standalone site). Works on smartphones, tablets, and desktops. No app store required — users click a link and play instantly.

**Tech Stack:** Phaser 3 (HTML5 game framework), vanilla JavaScript, HTML5 Canvas. No backend required. Static site deployable to Netlify/Vercel/GitHub Pages.

---

## Target Audience

- Fans of 80s rock/hair metal (30-60 age range)
- Documentary viewers and potential viewers
- Casual gamers who enjoy retro arcade nostalgia
- Social media users who discover the game via shared links

---

## Game Structure

### Character: The Rockstar

- **Appearance:** Big teased hair, hairy chest (open vest or no shirt), spandex pants, pointy boots
- **Sprite size:** ~64x64 pixels, animated walk/jump/idle/catch/hurt cycles
- **Win transformation (Level 3):** Short hair, white t-shirt, jeans — the "reinvented" look

### HUD (Heads-Up Display)

- **Health bar:** Top-left, styled as a guitar amplifier meter (goes from green to red)
- **Score:** Top-right, retro pixel font, arcade-style rolling numbers
- **Notes counter:** Small, subtle musical note icon + count, bottom-left (intentionally easy to overlook)
- **Level indicator:** Top-center

---

## Level 1: "Headed for a Heartbreak" (1987-1991)

### Genre
Catcher / Dodge game

### Setting
A massive concert stage. The rockstar stands on stage and can move left/right. Crowd in the background with lighters, neon lights, fog machine effects. Stage has amp stacks and speaker columns on the edges. Scrolling concert light effects above.

### Mechanics

- **Controls:**
  - Desktop: Arrow keys (left/right movement), or A/D keys
  - Mobile: Touch left/right side of screen to move, or on-screen arrow buttons
- **Player movement:** Horizontal only (left/right across the stage). No jumping needed — this is a pure catcher game.
- **Items fall from above** (from stage rigging/lights area) at varying speeds and trajectories:

#### Good Items (CATCH these)
| Item | Points | Visual | Drop Rate |
|------|--------|--------|-----------|
| Royalty checks ($$$) | +100 | Green dollar bills / checks | Common |
| Gold records | +250 | Gold vinyl disc, shiny | Medium |
| Stars (fame) | +500 | Gold/yellow star, sparkle effect | Rare |
| Musical notes | +50 | Small purple/blue eighth notes | Medium, but small & subtle |

#### Bad Items (AVOID these)
| Item | Damage | Visual | Drop Rate |
|------|--------|--------|-----------|
| Whiskey bottles | -1 health unit | Brown bottle, liquid sloshing | Common |
| Syringes | -2 health units | White syringe | Less common but deadly |

### Health System
- Player starts with **5 health units**
- Catching a bottle: lose 1 unit
- Catching a syringe: lose 2 units
- At 0 health: **OVERDOSE — GAME OVER**
  - Screen flashes red, goes dark
  - Ambulance siren SFX
  - "GAME OVER — OVERDOSE" text
  - Option to retry Level 1

### Musical Notes (Hidden Objective)
- Notes are the **secret key** to winning Level 3
- They are intentionally small and subtle compared to flashy money/stars
- A quiet counter tracks them in the corner (easy to ignore on first playthrough)
- **Threshold: 15 notes** needed to unlock the win condition in Level 3
- This creates replayability — first-time players will likely focus on big-score items and miss notes

### Duration
- ~90 seconds (roughly one "song" length)
- Difficulty ramps: items fall faster, more bad items appear as time progresses
- Must survive the full duration AND have a minimum score of 1000 to advance

### Transition to Level 2
- Score tally screen shows points earned
- Notes collected shown as a small line item (not emphasized)
- Text: *"The crowd loves you. But not everyone is a fan..."*
- Visual: A TV screen in the corner flickers, showing a pixelated Metallica logo

---

## Level 2: "Revenge of the Dart" (1992)

### Genre
Target / Aim game (dart throwing)

### Setting
Backstage / dive bar scene. Dim lighting, beer signs on walls, tour posters. Center of screen: a regulation dartboard mounted on the wall with **Lars Ulrich's face** as the target (pixelated caricature). A small CRT TV in the background corner plays a tiny pixel animation referencing the infamous Metallica video where Lars wore a Kip Winger t-shirt as a joke.

### Mechanics

- **Controls:**
  - Desktop: Mouse to aim crosshair, click to throw dart
  - Mobile: Touch/drag to position crosshair, release to throw
- **The dartboard MOVES:**
  - Sways left/right in a semi-random pattern
  - Occasionally bobs up/down
  - Speed increases slightly as the round progresses
- **Dart throwing:**
  - Unlimited darts, but one at a time
  - ~1 second reload cooldown between throws (animated hand grabbing new dart)
  - Dart flies from bottom of screen to where crosshair was positioned

#### Scoring
| Hit Zone | Points | Feedback |
|----------|--------|----------|
| Bullseye (Lars's nose) | +1000 | Screen flash, crowd laugh, Lars's face gets angrier |
| Inner ring | +500 | Thud sound, small cheer |
| Outer ring | +250 | Light thud |
| Miss (hit wall) | 0 | "Boo" sound, dart sticks in wall |

### Can't Lose
- This level is pure catharsis and comic relief
- No health bar, no fail condition
- Player throws **10 darts** total, then the level ends
- Bonus: hitting 7+ bullseyes triggers an Easter egg (Lars makes a funny frustrated animation)

### Transition to Level 3
- Score tally
- The CRT TV in the background changes: hair metal videos switch to rainy Seattle footage
- Lights dim dramatically
- Text: *"That felt good. But something darker is coming from Seattle..."*
- Rain begins falling on screen during transition

---

## Level 3: "Smells Like the End" (1992-1994)

### Genre
Side-scrolling brawler (TMNT arcade style — this is the signature level)

### Setting
A dark, rainy Seattle club/alley. Dim lighting, brick walls covered in grunge band flyers, broken neon signs, puddles on the ground reflecting light. Rain particles falling constantly. This is the visual OPPOSITE of Level 1's bright, glamorous stage.

### Enemies: Grunge Guys
- **Appearance:** Blonde hair (shoulder-length, messy), ripped jeans, flannel/checker shirts, combat boots
- **Behavior:** Walk toward the rockstar from both sides of the screen
- **Attacks:**
  - Punch/shove (close range)
  - Throw vinyl records (projectile, medium range)
  - Power chord shockwave (rare, area-of-effect — a visible soundwave that pushes rockstar back)
- **Spawn pattern:** Waves of 2-3 enemies, getting denser over time
- **Total waves:** 5 waves

### Player Mechanics

- **Controls:**
  - Desktop: Arrow keys to move left/right, Space to attack, Z for special
  - Mobile: Virtual D-pad (left side) + attack button (right side)
- **Movement:** Left/right, can also face direction of enemies
- **Weapons:**
  - **Mic stand** (default): Medium range, medium damage, fast swing
  - **Electric guitar** (power-up, spawns on ground occasionally): Wide swing arc, high damage, but slower. Breaks after 5 hits.
- **Health:** Same 5-unit health bar from Level 1 (does NOT reset — carries over, but heals to at least 3 units at level start)

### The Notes Mechanic (Core Twist)

This is where the hidden notes from Level 1 pay off:

**IF player collected 15+ notes in Level 1:**
- After wave 3, a cutscene triggers: the rockstar's attacks gain a **golden glow** (classical music power)
- The musical notes swirl around the rockstar like a shield
- Grunge enemies slow down when near the rockstar
- The background music shifts to incorporate orchestral/classical elements
- The rockstar can now push through waves 4 and 5 with this advantage
- **Result: WIN ENDING**

**IF player collected fewer than 15 notes:**
- No classical music power activates
- Waves 4 and 5 become overwhelming — enemies spawn faster than you can defeat them
- Eventually the rockstar is surrounded and knocked down
- **Result: LOSE ENDING**

### WIN ENDING: "Reinvention"

Cutscene sequence:
1. The rockstar stops fighting. Puts down the mic stand.
2. Animation: scissors appear, long hair is cut off
3. Outfit change: spandex morphs to white t-shirt and jeans
4. He picks up a classical/acoustic guitar
5. The rain stops. Sunlight breaks through the clouds.
6. The grunge guys look confused, then slowly walk away.

**Text crawl:**
> *"The hair metal era was over. But the music never died.*
> *Kip Winger reinvented himself — studying classical composition and orchestration.*
> *He proved that real musicians don't fade away. They evolve."*

**CTA Button:** "WATCH THE FULL STORY" → links to the documentary

**Bonus:** High score entry (3-letter initials, arcade-style)

### LOSE ENDING: "Casualty of Grunge"

Cutscene sequence:
1. The rockstar is knocked down, surrounded by grunge guys
2. Screen fades to a pixelated office desk
3. A hand stamps "CONTRACT TERMINATED" on a document
4. The rockstar's gold records on the wall behind the desk crack and fall

**Text crawl:**
> *"Another casualty of grunge. The label dropped him. The crowds moved on.*
> *But was this really the end of the story?"*

**CTA Button:** "FIND OUT WHAT REALLY HAPPENED" → links to the documentary

**Note:** The lose ending is intentionally designed to be MORE intriguing — it drives curiosity about the documentary.

---

## Visual Style Guide

### Overall Aesthetic
- **Pixel art, 16-bit era** inspired by TMNT arcade (Konami, 1989)
- **Resolution:** Game renders at 480x270 (16:9 pixel art), scaled up to fill screen
- **Color palette:** Bold, saturated colors for Level 1; muted for Level 3
- **Font:** Retro pixel font (like Press Start 2P or similar)
- **UI elements:** Chunky, arcade-style — think quarter-slot attract screens

### Sprite Specifications
- **Rockstar:** 64x64px, animations: idle (2 frames), walk (4 frames), catch (2 frames), hurt (2 frames), attack (3 frames), victory (4 frames)
- **Grunge enemies:** 48x48px, animations: walk (4 frames), attack (3 frames), hurt (2 frames), defeat (3 frames)
- **Items (Level 1):** 24x24px each, animated rotation/sparkle
- **Dartboard (Level 2):** 128x128px, Lars face detailed within
- **Dart:** 16x32px, animated flight

### Backgrounds
- **Level 1:** Concert stage, parallax scrolling lights, animated crowd silhouettes
- **Level 2:** Backstage bar, static with animated TV and neon signs
- **Level 3:** Seattle alley, parallax rain, animated puddle reflections

---

## Audio

### Music
- **Title screen / Level 1:** 8-bit / chiptune version of upbeat hair metal (original composition to avoid licensing)
- **Level 2:** Comedic, lighthearted chiptune tune
- **Level 3:** Dark, heavy, grunge-influenced chiptune that shifts to incorporate classical elements if win condition is triggered
- **Win ending:** Triumphant orchestral chiptune
- **Lose ending:** Somber, slow chiptune

### Sound Effects
- Coin/item collect sounds (classic arcade)
- Bottle smash, syringe "ouch" sting
- Dart throw whoosh, thud on board, bullseye fanfare
- Punch/hit impacts for brawler combat
- Crowd cheering (Level 1), crowd laughing (Level 2)
- Rain ambience (Level 3)
- Game over siren
- 8-bit "ding" for level transitions

---

## Technical Requirements

### Responsive Design
- Canvas scales to fill viewport while maintaining 16:9 aspect ratio
- Black letterboxing on non-16:9 screens
- Minimum playable width: 320px (iPhone SE)
- Touch controls auto-detected on mobile; keyboard + mouse on desktop

### Performance Targets
- 60 FPS on modern devices
- < 5MB total asset size (pixel art keeps this small)
- < 3 second load time on 4G connection
- No external API calls during gameplay

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- iOS Safari 14+
- Android Chrome 90+

### Project Structure
```
/
├── index.html              # Entry point
├── css/
│   └── style.css           # Minimal styles for canvas container
├── js/
│   ├── main.js             # Phaser game config, scene management
│   ├── scenes/
│   │   ├── BootScene.js    # Asset preloading
│   │   ├── TitleScene.js   # Title screen / attract mode
│   │   ├── Level1Scene.js  # Catcher game
│   │   ├── Level2Scene.js  # Dart game
│   │   ├── Level3Scene.js  # Brawler game
│   │   ├── CutsceneScene.js # Between-level narratives
│   │   ├── WinScene.js     # Win ending
│   │   ├── LoseScene.js    # Lose ending
│   │   └── GameOverScene.js # Overdose game over (Level 1)
│   ├── sprites/
│   │   └── (sprite generation or inline)
│   └── utils/
│       ├── Controls.js     # Input handling (keyboard + touch)
│       └── AudioManager.js # Sound management
├── assets/
│   ├── sprites/            # PNG sprite sheets
│   ├── audio/              # MP3/OGG sound files
│   └── fonts/              # Pixel fonts
└── PRD.md                  # This document
```

### Deployment
- Static files only — deploy to any CDN/static host
- Recommended: Netlify or Vercel for easy deployment with custom domain
- Can also be embedded in an iframe on the documentary website

---

## Game Flow Summary

```
[TITLE SCREEN] → [INTRO CUTSCENE]
        ↓
[LEVEL 1: Catcher] → Die? → [GAME OVER: Overdose] → Retry
        ↓ Pass
[TRANSITION CUTSCENE 1→2]
        ↓
[LEVEL 2: Darts] → (Can't lose)
        ↓
[TRANSITION CUTSCENE 2→3]
        ↓
[LEVEL 3: Brawler]
    ↓                    ↓
  15+ notes?          < 15 notes?
    ↓                    ↓
[WIN ENDING]        [LOSE ENDING]
"Reinvention"       "Casualty of Grunge"
    ↓                    ↓
[→ Documentary]     [→ Documentary]
```

---

## Prototype Scope (MVP)

For the initial prototype, implement:

1. **Title screen** with "PRESS START" and retro styling
2. **Level 1** fully playable with placeholder sprites (colored rectangles/simple shapes), all item types, health system, notes counter, overdose game over
3. **Level 2** fully playable — moving dartboard with target zones, scoring, 10-dart limit
4. **Level 3** fully playable — brawler with grunge enemies, mic stand + guitar weapons, notes mechanic branching
5. **Both endings** with text crawls and CTA buttons
6. **Responsive controls** — keyboard on desktop, touch on mobile
7. **Placeholder audio** — use Web Audio API for simple synth beeps/effects
8. **Score tracking** across all levels

Art assets will use programmatically generated pixel art (canvas-drawn sprites) for the prototype. These can be replaced with hand-drawn sprite sheets later.

---

## Future Enhancements (Post-Prototype)

- Professional pixel art sprite sheets
- Original chiptune soundtrack
- Global leaderboard (would require simple backend)
- Social sharing ("I scored X — can you survive grunge?")
- Unlockable gallery of real Kip Winger photos/video clips
- QR code integration for documentary screening events
- Analytics tracking (how many players reach each level, win vs lose ratio)
- Additional Easter eggs and hidden content
