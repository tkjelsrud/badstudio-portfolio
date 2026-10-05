# /rhyme — rhymes in the terminal

A small zsh function for finding rhymes while writing lyrics. It takes the
**last word** of whatever you type and prints perfect rhymes and near rhymes,
grouped by syllable count.

```
$ /rhyme set the world on fire
Rhymes for "fire"
  1 syl: spire, twire, squire, quire, wire, lyre
  2 syl: inquire, esquire, pyre, require, inspire, aspire, expire, retire, haywire, crossfire, …
  3 syl: desire, acquire, quagmire, satire, attire, bonfire, wildfire, entire, conspire, …
Near rhymes
  1 syl: sneer, jeer, glare, clear, core, flare, stir, …
  2 syl: obscure, despair, implore, secure, endure, declare, …
```

## Usage

```
/rhyme some text here      # rhymes the last word ("here")
rhyme why so stressed?     # same, but ? ! * work unquoted
```

- No quotes needed around the text.
- Punctuation and capitalization are stripped, so `fire!` → `fire`.
- `rhyme` (no slash) is an alias that runs `/rhyme` with `noglob`, so zsh
  doesn't try to expand `?` or `*` as file patterns. With `/rhyme`, a trailing
  `?` gives "no matches found".
- An unmatched apostrophe (`rhyme don't stop`) makes the shell wait for more
  input — that's parsed before the function runs. Quote the line or drop the
  apostrophe.

## Install

Add to `~/.zshrc`, then open a new tab or run `source ~/.zshrc`:

```zsh
# --- rhyme: look up rhymes for the last word via Datamuse ---
# usage: /rhyme set the world on fire   (or: rhyme ...)
/rhyme() {
  local w=${${(L)argv[-1]}//[^a-z\']/}
  [[ -z $w ]] && { echo "usage: /rhyme <text>"; return 1; }
  local fmt='group_by(.numSyllables) | .[] | "  \(.[0].numSyllables) syl: " + (map(.word) | join(", "))'
  print -P "%BRhymes for \"$w\"%b"
  curl -s "https://api.datamuse.com/words?rel_rhy=$w&md=s&max=80" | jq -r "$fmt" | fold -s -w $(( COLUMNS > 20 ? COLUMNS : 100 ))
  print -P "%BNear rhymes%b"
  curl -s "https://api.datamuse.com/words?rel_nry=$w&md=s&max=30" | jq -r "$fmt" | fold -s -w $(( COLUMNS > 20 ? COLUMNS : 100 ))
}
alias rhyme='noglob /rhyme'
```

Requires `curl` and `jq` (both ship with recent macOS).

## How it works

- **Datamuse API** (`api.datamuse.com`) — free, no API key, ~100k requests/day.
  It's the same data source that powers RhymeZone.
  - `rel_rhy=` perfect rhymes, `rel_nry=` near rhymes
  - `md=s` adds `numSyllables` to each result, used for grouping
- `${(L)argv[-1]}` lowercases the last argument; `//[^a-z\']/` strips anything
  that isn't a letter or apostrophe.
- `fold` wraps long lines to the terminal width. The `COLUMNS > 20 ? … : 100`
  fallback is there because `COLUMNS` is `0` in non-interactive shells, and
  `fold -w 0` fails silently (empty output).

## Caveats

- Results are ordered by Datamuse's relevance score, not by how common a word
  is — rare words like "twire" can show up early.
- Syllable counts are approximate ("desire" comes back as 3).

## Ideas

- `/rhyme -n <text>` for near rhymes only
- Sort by word frequency (`md=f`) to push rare words down
- Phrase rhymes ("orange" → "door hinge")
- Other Datamuse relations: `rel_syn` (synonyms), `ml=` (means like), `sl=` (sounds like)
