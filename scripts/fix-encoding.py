"""
Fix double-encoding corruption caused by prior latin-1→UTF-8 re-write.

Step 1: Undo the double-encoding: text.encode('latin-1') restores original bytes.
Step 2: Decode those bytes as UTF-8 → we get the cp1252-mojibake Unicode chars.
Step 3: Replace mojibake sequences with the intended Unicode characters.
Step 4: Write clean UTF-8.
"""

files = [
    r'apps\v4\app\(dashboard)\compliance\training-tab.tsx',
    r'apps\v4\app\(dashboard)\drivers\page.tsx',
]

# Mojibake sequence -> intended character
# Each bad string = the Unicode chars produced by reading the original UTF-8 bytes as cp1252
replacements = [
    # Dashes / typographic quotes
    ('\u00e2\u20ac\u201d', '\u2014'),   # â€" -> — em dash
    ('\u00e2\u20ac\u201c', '\u2013'),   # â€" -> – en dash
    ('\u00e2\u20ac\u2122', '\u2019'),   # â€™ -> ' right single quote
    ('\u00e2\u20ac\u0153', '\u201c'),   # â€œ -> " left double quote
    ('\u00e2\u20ac\u009d', '\u201d'),   # â€  -> " right double quote
    ('\u00e2\u20ac\u02dc', '\u2018'),   # â€˜ -> ' left single quote
    ('\u00e2\u20ac\u00a6', '\u2026'),   # â€¦ -> … ellipsis
    ('\u00e2\u20ac\u00a2', '\u2022'),   # â€¢ -> • bullet
    # Box drawing / arrows (common in /* --- */ section dividers)
    ('\u00e2\u201d\u20ac', '\u2500'),   # â"€ -> ─ box horizontal (U+2500)
    ('\u00e2\u2020\u0090', '\u2190'),   # â†  -> ← left arrow
    ('\u00e2\u2020\u2019', '\u2192'),   # â†' -> → right arrow
    # Math symbols
    ('\u00e2\u2030\u00a5', '\u2265'),   # â‰¥ -> ≥
    ('\u00e2\u2030\u00a4', '\u2264'),   # â‰¤ -> ≤
    # 2-byte mojibake (simple Latin Extended)
    ('\u00c3\u00b7', '\u00f7'),         # Ã· -> ÷
    ('\u00c2\u00b7', '\u00b7'),         # Â· -> ·
    ('\u00c2\u00b0', '\u00b0'),         # Â° -> °
    ('\u00c2\u00b1', '\u00b1'),         # Â± -> ±
    ('\u00c2\u00a9', '\u00a9'),         # Â© -> ©
    ('\u00c2\u00ae', '\u00ae'),         # Â® -> ®
    ('\u00c2\u00a0', '\u00a0'),         # Â  -> NBSP
    # Accented letters
    ('\u00c3\u00a9', '\u00e9'),         # Ã© -> é
    ('\u00c3\u00a8', '\u00e8'),         # Ã¨ -> è
    ('\u00c3\u00a0', '\u00e0'),         # Ã  -> à
    ('\u00c3\u00ba', '\u00fa'),         # Ãº -> ú
    ('\u00c3\u00b6', '\u00f6'),         # Ã¶ -> ö
    ('\u00c3\u00a4', '\u00e4'),         # Ã¤ -> ä
    ('\u00c3\u00bc', '\u00fc'),         # Ã¼ -> ü
    ('\u00c3\u00b3', '\u00f3'),         # Ã³ -> ó
]

total_fixed = 0
for f in files:
    # Read the double-encoded file as UTF-8
    with open(f, encoding='utf-8') as fh:
        text = fh.read()

    # Step 1: Undo the double-encoding.
    # The prior script turned raw bytes → latin-1 chars → UTF-8.
    # Encoding back to latin-1 restores the original byte sequence.
    try:
        original_bytes = text.encode('latin-1')
    except UnicodeEncodeError as e:
        print(f'Warning: {f} has chars outside latin-1 range at position {e.start}. '
              f'Char: {repr(text[e.start])}. Skipping undo step for this file.')
        original_bytes = None

    if original_bytes is not None:
        try:
            text = original_bytes.decode('utf-8')
        except UnicodeDecodeError as e:
            print(f'Warning: Restored bytes are not valid UTF-8 in {f} at byte {e.start}. '
                  f'Bytes: {original_bytes[e.start:e.start+4].hex()}. Skipping.')
            # Read the original text back
            with open(f, encoding='utf-8') as fh:
                text = fh.read()

    # Step 2: Apply mojibake replacements
    original = text
    for bad, good in replacements:
        if bad in text:
            count = text.count(bad)
            text = text.replace(bad, good)
            total_fixed += count
            print(f'  [{count}x] {ascii(bad)} -> {ascii(good)}')

    if text != original or original_bytes is not None:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(text)
        print(f'  => Saved: {f}')
    else:
        print(f'  => No changes: {f}')

print(f'\nTotal replacements: {total_fixed}')
