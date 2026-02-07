/**
 * SFX Generation Script using ElevenLabs Text-to-SFX API
 *
 * Usage:
 *   npx tsx scripts/generate-sfx.ts
 *
 * Requires:
 *   ELEVENLABS_API_KEY environment variable (or in .env.local)
 *
 * This is a one-time generation script. Once the files are generated,
 * they are committed to the repo and this script is not needed again.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SFX_DIR = path.resolve(__dirname, '../packages/client/public/audio/sfx');

const SFX_PROMPTS: Record<string, string> = {
  // UI basics
  'btn-hover': 'soft subtle UI hover sound, light tap, digital interface, very short',
  'btn-click': 'crisp UI button click, satisfying mechanical press, short',
  'modal-open': 'smooth whoosh opening sound, UI panel reveal, soft',
  'modal-close': 'gentle closing whoosh, UI panel dismiss, soft',
  'dropdown': 'subtle dropdown menu open, light click',

  // Card interactions
  'card-draw': 'card dealing sound, playing card being dealt from deck, paper slide',
  'card-select': 'card pickup sound, paper lift with slight snap',
  'card-deselect': 'card put down sound, light paper tap on felt table',
  'card-slot': 'card snapping into place, satisfying click-lock sound',

  // Weaving
  'weave-start': 'mechanical loom starting up, gears engaging, industrial machine hum beginning',
  'weave-loop': 'continuous rhythmic loom weaving sound, mechanical textile loop, 5 seconds',
  'weave-success': 'successful completion chime, magical sparkle with deep resonance, achievement',
  'weave-fail': 'machine breakdown, gears grinding to halt, failure sound',

  // Combos
  'combo-detect': 'magical detection ding, golden shimmer sound, discovery chime',
  'combo-acquire': 'epic fanfare, mythical item acquired, triumphant short brass',

  // Stats
  'stat-up': 'ascending positive chime, stat increase, short rising tone',
  'stat-down': 'descending negative tone, stat decrease, short falling note',
  'danger-pulse': 'low warning pulse, heartbeat alarm, tension drone, short',

  // Events
  'event-trigger': 'dramatic alert horn, political crisis announcement, urgent brass',
  'event-choice': 'decisive selection sound, stamp or seal press, authoritative',
  'event-resolve': 'event resolution chord, tension release, settling tone',

  // Phase transitions
  'day-advance': 'day passing transition, clock chime, dawn sound, new beginning',
  'phase-change': 'subtle phase transition whoosh, regime shift, short',

  // Scapegoat wheel
  'wheel-spin': 'roulette wheel spinning, clicking ticking accelerating then decelerating, 2 seconds',
  'sacrifice': 'dark dramatic impact, sacrifice ritual, deep drum hit with dark reverb',

  // Discovery
  'discovery': 'magical discovery fanfare, treasure found, sparkling achievement jingle',
  'gov-transition': 'governmental announcement trumpet, political regime change fanfare, authoritative',

  // Death sounds
  'death-riot': 'angry mob sounds, crowd uprising, glass breaking, chaos',
  'death-starve': 'desolate wind, empty, famine atmosphere, despair',
  'death-madness': 'distorted reality, psychedelic breakdown, sanity loss, warped sound',
  'death-insanity': 'complete mental collapse, whispers and echoes, haunting',

  // Typewriter
  'typewriter': 'single typewriter key press, mechanical click, vintage, very short',
};

async function generateSfx(name: string, prompt: string, apiKey: string): Promise<Buffer> {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: name.includes('loop') ? 5 : name.includes('wheel-spin') ? 2 : undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ElevenLabs API error (${res.status}): ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  // Load .env.local
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('Missing ELEVENLABS_API_KEY. Set it in .env.local or as environment variable.');
    process.exit(1);
  }

  // Ensure output directory exists
  fs.mkdirSync(SFX_DIR, { recursive: true });

  const entries = Object.entries(SFX_PROMPTS);
  console.log(`Generating ${entries.length} sound effects...\n`);

  let success = 0;
  let failed = 0;

  for (const [name, prompt] of entries) {
    const outFile = path.join(SFX_DIR, `${name}.mp3`);

    // Skip if already generated
    if (fs.existsSync(outFile)) {
      console.log(`  [skip] ${name}.mp3 (already exists)`);
      success++;
      continue;
    }

    try {
      console.log(`  [gen]  ${name}.mp3 — "${prompt.slice(0, 50)}..."`);
      const buffer = await generateSfx(name, prompt, apiKey);
      fs.writeFileSync(outFile, buffer);
      console.log(`  [done] ${name}.mp3 (${(buffer.length / 1024).toFixed(1)} KB)`);
      success++;

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`  [FAIL] ${name}.mp3:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\nComplete: ${success} generated, ${failed} failed.`);
  if (failed > 0) {
    console.log('Re-run the script to retry failed generations.');
    process.exit(1);
  }
}

main();
