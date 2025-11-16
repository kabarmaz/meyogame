# MeyoGame — Deploying to GitHub Pages

This repository is a small static site with two games:
- `index.html` — Numbers memory game
- `audiovisual.html` — Audio Visual Memory (B1)

Quick deployment instructions to publish this repository on GitHub Pages (no build step required).

1) Create a new GitHub repository (if you haven't) and push this project to it. From PowerShell run from the repository root:

```powershell
git init
git add .
git commit -m "Initial commit — add games and audiovisual page"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

2) Enable GitHub Pages
- On GitHub, open the repository Settings → Pages
- Under "Source" choose the `main` branch and the `/ (root)` folder
- Save. GitHub will publish the site to `https://<your-username>.github.io/<your-repo-name>/`.

3) Files to check after publishing
- `index.html` will be available at the root URL.
- `audiovisual.html` will be available at `.../audiovisual.html`.

Optional: automatic deploy via `gh-pages` (npm)
- If you'd rather deploy using the `gh-pages` package, create a `package.json` and add a `deploy` script; let me know and I'll add it.

Notes
- The repository includes a `.nojekyll` file to ensure GitHub Pages serves files as-is.
- If you use a custom domain, add a `CNAME` file in the repo root with your domain.

If you want, I can push these files and create a small `package.json` + `gh-pages` workflow for automatic deployments.
# Memory Max — small web memory game

This is a small HTML/CSS/JS game that shows short sequences of numbers between 1 and 15 (each number displayed for ~1 second). After each sequence the player should tap the largest number shown. Rounds increase in length (1, 2, 3, ...). The UI is mobile-focused and optimized for an iPhone 13 mini viewport.

Gameplay rule (pivot — Option 1)
- The game uses the "first larger number" pivot rule: scan the shown sequence left→right and find the first element that is larger than the element before it — that's the pivot. The correct answer is the concatenation (in original order) of all numbers in the sequence that are >= the pivot.
- Example: sequence [7, 3, 6, 4]
	- first increase found at 3→6 so pivot = 6
	- numbers >= 6 in original order: 7, 6
	- correct answer (concatenated): "76"
- Fallback: if the sequence has no increase (monotonically non-increasing), the pivot used is the maximum number in the sequence (so the answer becomes all numbers >= that max — usually just the max itself).

Input method
- After the numbers are shown, the player taps the number tiles to build the concatenated answer (e.g. tapping 7 then 6 yields "76"). Use Clear to reset the typed answer or Submit to check it.

Files
- `index.html` — main page
- `style.css` — styles targeted to mobile
- `app.js` — game logic

How to publish on GitHub Pages
1. Create a new repository on GitHub or use an existing one.
2. Put these files in the repository root (index.html in the root makes GitHub Pages serve it automatically).
3. Push to GitHub. In repository Settings → Pages, choose branch `main` (or `gh-pages`) and root `/` as the folder. Save.
4. After a minute the site will be available at `https://<your-username>.github.io/<repo-name>/`.

Try it locally
- Open `index.html` in a mobile browser or in desktop browser and resize to mobile width.
- For better parity with iPhone rendering, use Chrome DevTools Device Mode or Safari Responsive Design Mode.

Customization
- Change `MAX_NUM` in `app.js` to allow a different number range.
- Change the per-number display duration in `showSequence` (currently ~1s per number).

Notes and assumptions
- I used the fallback pivot = max(sequence) if no first-increase exists to keep rounds playable.


Next steps / improvements
- Add sound/animation feedback, persistent high scores, progressive difficulty, or convert to a PWA for install on homescreen.
