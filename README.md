# C-9 Drywall Practice Quiz Website

A simple static quiz website for practicing California C-9 Drywall questions in English and Spanish.

## What is included

- English and Spanish versions
- List 1: found/public example-style questions
- List 2: generated practice questions based on C-9 study sections
- Mixed mode
- Practice mode with instant right/wrong feedback
- Test mode with final score
- Explanation panel
- Missed-question review
- Mobile-friendly layout
- No login, no database, no backend

## How to open locally

1. Unzip the folder.
2. Double-click `index.html`.
3. The quiz opens in your browser.

## How to deploy with GitHub Pages

1. Create a new GitHub repository, for example: `c9-drywall-practice`.
2. Upload these files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `questions.js`
   - `README.md`
3. In GitHub, go to **Settings > Pages**.
4. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.
6. GitHub gives you a public website link.

## Updating questions

Edit `questions.js`. Each question has:

- English question
- Spanish question
- English answer choices
- Spanish answer choices
- Correct answer number
- Section name
- List source

## Important note

This is a study tool only. It is not official CSLB exam content and does not guarantee the exact questions that will appear on the exam.


## Quiz behavior

Each quiz gives 20 random questions from the selected list. List 1 and List 2 are kept separate.

## Current features

- English and Spanish
- List 1 and List 2 stay separate
- 20 random questions per quiz
- List 1 includes 86 questions
- Instant feedback in Practice mode
- Score history saved in the browser with localStorage
- Best score and average score tracking



## Version 6 fix

Cache-busting was added to the CSS and JavaScript file references so GitHub Pages/browser caches load the latest site files after an update. Score history now refreshes immediately on the results screen.
