# Scene to Story!

Static HTML/CSS/JavaScript implementation of the PRD.

## Included
- 5-step flow: Observe & Plan → Draft → Coach Hint → Rewrite → Finish
- Level 1 / 2 / 3 support
- Praise → Fix → Question feedback
- Hint 1 / 2 / 3 ladder
- Privacy blocking for real name/school/phone/address patterns
- Before / After comparison
- Reflection + AI-help summary
- "See a Sample" only at Step 5
- My Records
- Teacher View (read-only)
- Demo mode with localStorage
- Firebase hooks for Google login + Firestore

## Files
- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`
- `firestore.rules`
- `vercel.json`

## Local test
Because `script.js` is an ES module, run a simple server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Vercel
This project does not use Vite.

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty

## Firebase setup
The app works end-to-end in Demo Student mode before Firebase is configured.
To enable the PRD's real Google login / Firestore records:

1. Create a Firebase project.
2. Add a Web App.
3. Copy the Firebase web config into `firebase-config.js`.
4. Authentication → Sign-in method → enable Google.
5. Firestore Database → create a database.
6. Replace `teacher@example.com` in **both** `firebase-config.js` and `firestore.rules` with the instructor's teacher email.
7. Paste `firestore.rules` into Firestore → Rules → Publish.
8. Deploy the static files to Vercel (HTTPS).

## AI feedback
The PRD requires the coach to give only one point at a time and never rewrite the student's text before the final step. This project uses a local rule-based Coach Pic so it works without exposing an API key or requiring a paid API. If your course later requires a live generative model, replace `chooseFeedback()` with a secure server-side call; do not place a secret API key in browser JavaScript.
