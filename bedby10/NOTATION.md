# Chord notation reference (bedby10)

`bedby10/index.html` uses custom HTML tags (`<song>`, `<chord>`, `<riff>`, ...)
rendered by an external library: `chord-simple.css` / `chord-simple.js` /
`chord-fingerings.js`, loaded from `https://tkjelsrud.github.io/chords/lib/`.
That library is not part of this repo — this file documents what it actually
does, based on reading its source, so future edits don't have to guess.

## First principle

**This is a note-taking / visualization tool for the practice room, not a
data format.** Readability at a glance beats correctness of the underlying
markup. Free text inside a `<chord>` box (e.g. `(inv G#)`, `B (Bb)`,
`E pedal line`) is a normal and supported way to jot down an idea that
doesn't have a settled name or voicing yet — it just won't get the
automatic color-coding (see below).

## Structure tags

- `<song>` — one song/idea block, separated visually with a bottom border.
- `<h2 id="...">Title</h2>` — song title. The `id` feeds the auto-generated
  top nav (`#song-nav` script at the top of the file) and anchor links.
  Newest songs go at the top of the file to show up first in the nav.
- `<song-meta>` — small grey metadata line under the title. Put `<span>`s
  inside for things like `Key:`, `Effect:`, tempo, etc.
- `<h3>` — section heading inside a song (Intro, Verse, Chorus, ...).
- `<p>` — grey note text (instructions, reminders, links).
- `<br/>` — used a lot to break a run of `<chord>` boxes onto a new visual
  line, e.g. to separate two alternate progressions for the same section.
- `<hr/>` — divider between unrelated groups of songs.

## `<chord>` boxes

Plain: `<chord>Bb</chord>` — a box with the text inside.

Attributes actually read by the JS/CSS:

| Attribute | Effect |
|---|---|
| `oct="1"` / `oct="2"` | Small "octave technique" icon (visual hint for playing the shape an octave up/down). |
| `shell="1"` / `shell="2"` | Small "shell voicing" icon (major/minor shape depends on the chord name). |
| `up` / `down` | Boolean attribute → shows a legacy `↑` / `↓` arrow badge in the corner. This is what we've been using for "high octave arrows". |
| `bass="..."` | **Stacks the box into two lines**: chord name on top, the `bass` value on the bottom, in one compact box. Despite the name, it's a generic two-line stack — we've used it for a real bass note (`bass="B"` → `D#m/B`) *and* for stacking a modifier note under a chord (`bass="sus4"` on `A#` to show A# with sus4 stacked below, instead of two separate chord boxes). |
| `alt` | Dashed border — marks the box as an alternative/variant chord. |
| `half` | Narrower box, meant so two can sit in one normal chord slot (quick passing chords). |

Color coding: the CSS gives a box a colored top bar based on an **exact
string match** of the chord name against a fixed table (root note × a
specific suffix list: `7`, `maj7`, `9`, `add9`, `sus4` for major-ish, `m`,
`m7`, `min`, `min7`, `dim` for minor-ish). Anything outside that exact list
— free text, unusual extensions, placeholder notes like `(inv G#)` — just
renders as a plain uncolored box. That's expected, not a bug: don't chase
exact chord-name spelling just to get a color.

## `<riff>` boxes (tab)

`<riff note="...">` / `<riff hint="...">` and `<riff title="...">` /
`<riff label="...">` show a caption above the tab. `repeat="n"` / `x="n"`
shows a repeat marker.

The parser only turns a line into a proper per-string tab row if the line
**starts with a recognized string letter**: `e`, `b`, `g`, `d`, `a`, or
capital `E` (low E). Lines that don't start with one of those (e.g. our
raw `x-x-8-10-10-x-` arp lines) are not parsed as a string row — they just
render as plain fallback text. That's fine for quick single-line arp/finger
patterns, but if a riff is meant to be read as a real multi-string tab,
each line needs its string-letter prefix (see existing multi-line riffs
like the "Pheromones" solo for the pattern).

## Conventions we've settled on in practice

- An idea that doesn't have a firm chord name yet: write it as free text in
  a `<chord>` box (e.g. `(inv G#)`), not as a made-up chord name.
- A chord with a suspended/added note that's really "the same chord plus a
  note", not a separate chord to strum: stack it with `<chord bass="sus4">`
  rather than adding a second full chord box.
- Two alternate progressions for the same section: list the chords for
  version 1, `<br/>`, then version 2 — no text label needed, the line break
  reads clearly enough on its own.
- Short single-line fret patterns that are really separate arp/finger
  ideas: give each its own `<riff note="...">` box rather than cramming
  them into one multi-line riff (multi-line riffs are reserved for actual
  simultaneous-string tab, per the string-letter-prefix rule above).

## Open questions (revisit next time something doesn't render right)

- Whether we want a cleaner way to write "inversion of X" than a free-text
  placeholder — no attribute for this exists in the library today.
- `half` has never actually been used yet in this file — confirm the
  passing-chord use case before relying on it.
