# Blue Spice Web Studio — marketing site

Static one-page site selling website design & development services.
No build step, no dependencies. Open `index.html` or serve the folder.

```bash
python -m http.server 5178 --directory "G:/blue spice web design company"
```

## Files

| File | What's in it |
|---|---|
| `index.html` | All content and structure |
| `styles.css` | Full design system (tokens at the top of the file) |
| `script.js` | Nav, word rotator, scroll reveals, counters, FAQ, WhatsApp form |

## Design approach

Modelled on ewokesoft.com's trick of building a striking hero with **zero photography**:
everything visual is CSS or inline SVG — animated gradient blobs, a grid overlay, an SVG
noise layer, and fake browser/phone "site previews" made of gradient blocks. Nothing to
license, nothing to load, no stock photos.

Palette is deliberately bright for the Indian market (electric blue → violet → magenta →
saffron → teal) on a white/cream base so it still reads clean and professional.

Mobile-first: base styles are for 375px, breakpoints at 600px and 900px.

## No pricing on this site

Deliberate — the client doesn't want numbers on the page. Every path ends at a quote
instead. The FAQ answers "What does a website cost?" with scope-and-quote language rather
than a figure. **Don't reintroduce prices without asking.**

## Before this goes live — needs client sign-off

1. **Email** — `mail@bluespice.us` (contact section + footer). Confirm it's the right
   inbox and that it's actually receiving. Phone `+91 93885 99000` is their real number.
2. **Claims in the copy** — "loads in under 2 seconds", "98 PageSpeed", "delivered in
   7–10 days" style lines are aspirational. Keep only what Blue Spice will stand behind.
3. **Company name** — currently "Blue Spice Web Studio". Swap the wordmark text in the
   header, footer and `<title>` if they want a different name.

## How the contact form works

There is no backend. On submit, `script.js` builds a pre-filled WhatsApp message and opens
`wa.me/919388599000`. Change the number in one place — the `WHATSAPP` constant at the
bottom of `script.js`. If they later want email delivery instead, drop in a Formspree /
GHL form endpoint and replace the submit handler.

## Deploy

Not deployed yet — needs Abhinand's go-ahead on the hosting target. It's a plain static
folder, so Cloudflare Pages works: point it at this directory, no build command, output
directory `/`.
