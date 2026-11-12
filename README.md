# Cueue · hi-fi prototype

Static, clickable prototype of Cueue, a planning, approvals and payments app for independent creatives and small studios.

- `/` opens the studio app at sign in and runs as a clickable flow. `/CSignIn` is the client app. `/screens` lists every screen.
- `proto.js` makes buttons, tabs, toggles and picks respond, with toasts for actions that stay on the page.
- `cueue.css` holds the design tokens: warm greys, cool grey and charcoal ink, Zilla Slab for big type, SF Pro for everything else, and one soft aura gradient.
- `img/` holds the project photos.

No build step. Vercel serves the folder as is (`vercel.json` turns on clean URLs).
