---
name: songbook-editor
description: Write, edit, simplify, and transpose song entries in this project's custom songbook HTML format, including riffs, chord summaries, and rehearsal-friendly notes.
---

## What I do

- Edit song entries in the project's current custom songbook format
- Preserve the existing HTML/tag structure already used in the repo
- Add new songs, sections, riffs, chord summaries, and short rehearsal notes
- Transpose riffs and chord content accurately, including open strings and octave moves
- Simplify long repetitive tabs into compact chord movement when that is more useful
- Keep full tab only when fingering, rhythm, or a signature line matters
- Convert detailed note runs into practical summaries when the user asks for chord movement instead of exact tab
- Extend partial song entries over multiple prompts without rewriting unrelated parts

## When to use me

Use this skill when working on the repo's song pages, especially when the user asks to:

- add a song
- update a riff, chorus, intro, or solo
- transpose a song or riff
- simplify tabs into chords or comments
- keep tabs but make them more playable
- write rehearsal-friendly notes in the same house style

This skill is repo-specific because the song format is custom and may move locations over time.

## Current format

The current main songbook lives in `bedby10/index.html`, but do not hardcode that assumption when reasoning. First inspect the repo and the relevant page.

Preserve the existing structure and conventions used by the page, including tags like:

- `<song>`
- `<song-meta>`
- `<h2>`
- `<h3>`
- `<p>`
- `<riff>`
- `<chord>`

Follow the established tone: compact, practical, band-useful, and not overly theoretical.

## Working rules

1. Inspect the existing page before editing.
2. Match the formatting and style already present.
3. Prefer the smallest correct edit.
4. Keep comments short and useful for rehearsal.
5. Do not over-explain theory unless the user asks.
6. If a tab passage is mostly repeated hits of the same shape, prefer chord summaries plus one short comment.
7. If the user explicitly wants tab, keep tab.
8. If the user says the implied chords are not helpful, remove them and keep the direct musical representation they asked for.

## Transposition rules

When transposing:

- Move every pitch accurately by the requested interval
- Do not leave open strings unchanged unless they are still correct after transposition
- Re-check repeated drone notes and pull-offs against the new key
- If the transposed result becomes awkward or unplayable on the original string set, move the phrase to another string set while preserving pitch
- If needed, move a phrase an octave down or up only when the user wants a more playable version or the original register becomes impractical
- When an octave move is used, note it briefly in the song entry

## Simplification rules

Prefer chord summaries when:

- the tab is mostly repeated strums/hits of the same shape
- the user asks for the chord movement only
- the groove matters more than exact note-for-note detail

Prefer tab when:

- the phrase is a recognizable hook or signature riff
- fingering matters
- the rhythm or note order is the important thing
- chord reduction would be misleading

For mixed cases:

- use a short chord row
- add one comment underneath, like `bass moves under A-shape`
- use `riff` for the final bar or fill if the user wants to avoid clutter

## Style guidance

- Use concise labels like `Intro`, `Verse`, `Chorus`, `Solo 1`
- Use practical comments such as `Bass only first`, `Power chords`, `12th-fret triad shapes`, `Last bar: riff`
- Avoid turning every passage into a dense theory explanation
- Use power-chord summaries when that is what the band needs

## Example decisions

- Repetitive chorus figure: use `A5`, `B5`, `C5` plus a note about bass movement instead of full repeated tab
- Lead line with alternating upper notes: keep tab rather than forcing implied chords
- Solo transposed too high: move an octave down and rewrite on a more playable string set
