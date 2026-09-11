# Images still needed

Everything else is restored and local. These slots still show
`placeholder.svg` because no source file exists yet.

Drop the real file into `/assets/img/` and replace the
`/assets/img/placeholder.svg` value in the page listed.

## film (6 projects)

- **last-rodeo** — 'The Last Rodeo Concert' (line 690)
- **alls-fair** — "All's Fair in Love" (line 724)
- **dark-october** — 'Dark October' (line 741)
- **masked-king** — 'The Masked King' (line 775)
- **accelerate** — 'Accelerate Filmmakers Project' (line 792)
- **visa** — 'Visa on Arrival Season 5' (line 809)

## corporate (1 project)

- **bolt-nigeria** (line 250)

## magazines (1 of 14 still missing)

13 of the 14 covers are restored and local. The originals were
hotlinked from the old WordPress site (`i0.wp.com/savvymediaafrica.com/
wp-content/uploads/...`), which no longer exists — that domain now
serves this rebuild, so every one of those URLs 404s.

Where each was recovered from:

- 10 covers — rendered from page 1 of the magazine PDF on Google Drive,
  via `https://drive.google.com/thumbnail?id=<FILE_ID>&sz=w1400`, using
  the file IDs already in each card's "Read Magazine" link.
- 11th (Maria) and 12th (Ms DSF) — the Wayback capture of
  `/magazines/` at `20230314192247`, which archived both images.
- Covid-19 Digital Series — the BellaNaija article the card links to
  (`cover-for-covid-19-digital-series.jpg`).

All were resized to 800px wide, JPEG q82 (~1.7 MB for the set).

**Still missing: 16th Edition** ("Vibes & Hypes", Iweka Ihim, was
`2024/03/16th-edition.jpg`). It is not recoverable from public sources:
its card links to `/magazine-download`, which was an email-gated form
with no PDF link (so there is no Drive ID to render a cover from), and
Wayback archived that page's HTML but never fetched the image itself.
It needs the original file from the client.

Note: that card's "Read Magazine" link points at
`https://savvymediaafrica.com/magazine-download`, which is now a dead
URL on the rebuilt site — it needs repointing too.

## Note on the logo

`whitelogo.png` has a solid white background, so it shows as a white
box on the dark nav. A transparent knockout (white artwork) version is
needed for the dark state — making the current file transparent would
hide the navy wordmark instead.

## Recovery attempted — film stills are gone

Re-checked 12 Sep 2026 — same conclusion, plus two new dead ends:

- `tobi.savvymediaafrica.com`, the staging host the 2026 snapshot served
  some images from, no longer resolves (DNS).
- The origin now returns the rebuilt site's own `index.html` as its 404
  body, so every `wp-content/uploads/...` path 404s.

Note the filenames below: `download-3.jpg`, `images-1.jpg` are Chrome's
default names for Google Images saves. These were never Savvy's own
shoot files — the previous dev pulled them off the open web. So there is
no original to recover; the client has to supply real photos.

**Decision (12 Sep 2026): leave these on `placeholder.svg`.** Rather
than drop third-party stills into a portfolio that says "we ran this
event", the 7 projects below stay on placeholder until the client
provides their own coverage.

Checked on 11 Sep 2026, all negative:

- server (`find ~`) — not present
- cPanel `.trash` (504 entries) — not present
- Wayback Machine CDX — savvymediaafrica.com uploads are archived only
  for 2018–2023. Nothing from `uploads/2025/12/`.
- Wayback replay of each file — HTTP 404
- Downloads folder — the generically-named files there
  (`images.jpg`, `images (1).jpg`, `download.jpg`) are interiors and an
  exhibition logo, not film stills.

The film page WAS archived (snapshot 20260418043918) but only the HTML;
the images it references were never captured.

Originals needed, by project:

| Project | Files |
|---|---|
| last-rodeo | Screenshot-2025-12-08-122618.png, -123023.png, -122937.png |
| alls-fair | images-1.jpg, download-10.jpg |
| dark-october | IMG_6528.jpg, darkk.jpg, dark.jpg |
| masked-king | IMG_6524.jpg, download-4.jpg, download-3.jpg |
| accelerate | Screenshot-2025-12-08-165731.png, download-15.jpg |
| visa | download-14.jpg, download-13.jpg |
| bolt-nigeria (corporate) | IMG-2560-2048x1422-1.jpeg, IMG-1599-2048x1349-1.jpeg, IMG-1669-2048x1365-1.jpeg |

Bolt's three are older (`uploads/2018/09/`) and appear on the archived
`/portfolio-item/bolt/` page too, but Wayback captured only that page's
HTML — CDX has no capture of any `uploads/2018/09/IMG*` file.

These will have to come from the original shoot files or the client.
