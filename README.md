# PathFinder AI

# Lovable Prompt — AI Course Recommendation System

Copy everything below the line into lovable.ai as your project prompt.

---

Build a web app called **"AI Course Recommendation System"** — a rule-based course advisor that helps students find online courses matching their career goal, interests, and skill level, then generates a personalised learning path.

## Overview

Students register, complete a short skill assessment (career goal + interests + skill level), and receive a ranked list of recommended courses from a seeded catalogue, computed by a transparent point-scoring rule engine (not a black-box ML model). They can view course details, see a sequenced learning path for their domain, and export a summary report.

## Tech & Data

- React + Tailwind frontend, Supabase for the database and auth is fine.

- Use a clean, professional education/SaaS look: soft blue accent (#1F4E8C), light background (#F2F6FC), rounded cards, generous whitespace. Avoid a generic AI-purple gradient look.

- Persist everything in the database — students, the course catalogue, each assessment, and every generated recommendation (so a student's history can be viewed later).

## Data Model

**students**: id, name, email (unique), phone, created_at

**courses**: id, title, domain, level (Beginner | Intermediate | Advanced), duration, provider, prerequisite, description

**skill_assessments**: id, student_id (FK), career_goal, interests (array/text), skill_level, created_at

**recommendations**: id, student_id (FK), course_id (FK), score, created_at

Seed the `courses` table with ~25-30 courses spread across 7 domains: **Web Development, Data Science, Artificial Intelligence, Cybersecurity, Cloud Computing, Mobile Development, UI/UX Design** — each domain should have at least one Beginner, one Intermediate, and one Advanced course, each with a duration, a suggested provider (e.g. Coursera, Udemy, freeCodeCamp, AWS Training), a prerequisite (or "None"), and a one-line description. Also seed a `career_goals` mapping (used by the app, doesn't need its own table) that maps each career goal to its primary domain, e.g.:

- Web Developer → Web Development

- Data Scientist → Data Science

- AI / ML Engineer → Artificial Intelligence

- Cybersecurity Analyst → Cybersecurity

- Cloud Engineer → Cloud Computing

- Mobile App Developer → Mobile Development

- UI/UX Designer → UI/UX Design

## Recommendation Engine (rule-based — implement exactly as scoring logic, no ML)

For every course, compute a score for the current student:

- **+5** if the course's domain matches the primary domain of the student's chosen career goal

- **+2** if the course's domain is also among the student's selected interests

- **Level suitability**: +3 if course level == student's skill level; +1 if one level apart (e.g. Beginner student & Intermediate course); +0 otherwise

- **+0.5** bonus if the course has no prerequisite (surfaces foundational courses first for beginners)

Sort by score descending, keep only scores > 0, return the top 6. Save the results to `recommendations`.

## Pages / Flow

1. **Registration** — name, email, phone → creates/looks up the student, continue to assessment.

2. **Skill Assessment** — career goal (single-select dropdown), interests (multi-select checkboxes of the 7 domains), current skill level (Beginner/Intermediate/Advanced radio). Submitting scores and saves recommendations, then routes to results.

3. **Recommendations** — a sortable table/card list of the top matches: title, domain, level, duration, match score. Each row links to Course Details. Buttons to view the Learning Path and to generate the Report.

4. **Course Details** — full info for a selected course: domain, level, duration, provider, prerequisite, description, match score.

5. **Learning Path** — all courses in the student's target domain, ordered strictly Beginner → Intermediate → Advanced, as a step-by-step roadmap (timeline/stepper UI works well here).

6. **Report** — a clean summary (student name, career goal, skill level, generated date, ranked course list) with a "Download / Export" action (PDF or print-friendly view is ideal).

## Nice-to-haves if time allows

- A simple dashboard showing a student's past assessments and recommendation history.

- Ability to retake the assessment and compare a new set of recommendations against the previous one.

- Basic responsive/mobile layout.

## Explicitly out of scope

- No real machine learning model, embeddings, or external AI API calls — the "AI" is the transparent rule engine described above.

- No payment, course purchase, or third-party LMS integration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pathfinder-spark-139.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/06d85f59-8a67-4dec-bca7-29e23f7abefc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
