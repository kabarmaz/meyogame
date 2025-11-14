# Images for Memory Max Game

Place your y2k core myspace-style images in this folder:

- **intro.jpg** — image shown before pressing Start (gesture photo, yourself)
- **answer.jpg** — image shown on the answer page (gesture photo, yourself)
- **correct.jpg** — image shown when you get the answer right (celebration pose)
- **wrong.jpg** — image shown when you get the answer wrong (sad/funny pose)

## Recommended dimensions
- Square or portrait (e.g., 200×200px, 300×300px) to fit mobile screens.
- Use PNG or JPG format (the HTML links to .jpg but you can change the extensions in `index.html` if needed).

## Y2K Core Aesthetic Tips
- Add decorative borders (glitter frames, rainbow backgrounds, stickers).
- Use bold colors, sparkles, or retro filters.
- Lean into the nostalgic early-2000s vibe.

## Quick setup
1. Replace these image paths in `index.html` if your image extensions differ:
   - Line ~29: `<img id="introImage" src="images/intro.jpg" ...`
   - Line ~43: `<img id="answerImage" src="images/answer.jpg" ...`
   - Line ~59: `<img id="correctImage" src="images/correct.jpg" ...`
   - Line ~63: `<img id="wrongImage" src="images/wrong.jpg" ...`

If an image is missing, the app will still work — the placeholder will be blank.

