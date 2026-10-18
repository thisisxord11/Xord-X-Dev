XORD X DEV — STATIC WEBSITE
===========================

RUN THE WEBSITE
1. Extract this ZIP to a folder.
2. Open the folder.
3. Double-click index.html.
4. It should open directly in your browser. No Node.js, npm, build step or backend is required.

IMPORTANT: TALLY FORM SETUP
1. Open script.js in a plain-text editor (TextEdit in plain-text mode, VS Code, etc.).
2. At the top, find:
   const TALLY_FORM_URL = "";
3. Put your public Tally form URL between the quotes, for example:
   const TALLY_FORM_URL = "https://tally.so/r/yourFormID";
4. Save script.js and refresh index.html in your browser.

The site embeds the Tally URL in an iframe. Tally will process submissions and its own settings control notifications. Test the form after adding the link.

WHAT WORKS LOCALLY
- Responsive navigation and section links
- Live service search and category filters
- 2D / 3D visual mode toggle
- Global search (click magnifying glass or press Cmd/Ctrl + K)
- Local interactive service-guide chatbot demo
- Browser-only CV starter, document helper and slide planner
- Copy draft buttons where browser permissions allow
- Current year in footer

HONEST LIMITATIONS
- The assistant is a scripted demo guide, not a live AI model.
- The starter tools create local text drafts; they do not create DOCX/PDF files or call AI.
- A static site cannot securely store secret API keys or run private backend logic.
- The office address and team/experience claims were supplied by the site owner; confirm details before publishing.
- Google Fonts need an internet connection; system fallback fonts are included.
- Tally needs an internet connection and a valid public form URL.

CUSTOMIZATION
- index.html: page content and sections
- styles.css: colors, layout, animations, mobile responsiveness
- script.js: interactions, Tally URL, chatbot replies and browser tools

TEST CHECKLIST
[ ] Open index.html directly in a desktop browser.
[ ] Check the mobile layout by resizing the browser.
[ ] Search for “chatbot”, “CV”, and “marketing”.
[ ] Test each category filter and the 2D/3D toggle.
[ ] Open and use each browser tool.
[ ] Open the assistant and try the quick replies.
[ ] Add your real Tally URL and submit a test response.
