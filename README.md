# AI Career Assistant

An AI-powered career assistant that helps users analyse resumes against job descriptions, rewrite resume bullets, generate tailored cover letters, and prepare for interviews.

The app supports resume text extraction from TXT, PDF, and DOCX files, then uses the OpenAI API to generate structured career insights.

## Live Demo

Live app: https://ai-career-assistant-frontend.vercel.app/

## Features

* Resume upload and text extraction from TXT, PDF, and DOCX files
* AI-powered resume parsing into skills, experience, and project highlights
* Job description match scoring with overall, skills, experience, and keyword scores
* Strength and skill gap analysis based on resume and job description alignment
* Resume bullet rewriting with different tone options
* Tailored cover letter generation
* Interview preparation questions with answer hints
* Loading states and user-facing error handling
* Modular React component architecture
* Deployed on Vercel

## Tech Stack

* Next.js
* React
* TypeScript
* OpenAI API
* Vercel
* pdf-parse
* mammoth
* Tailwind CSS / CSS styling

## Project Motivation

This project was built as a practical AI product prototype for job application workflows. Instead of only showing static resume tips, the app allows users to upload or paste their resume, compare it with a target job description, and receive structured AI-generated feedback.

The goal was to practise building a production-style AI application with frontend state management, reusable components, backend API routes, file parsing, prompt design, structured JSON responses, and deployment.

## How It Works

1. The user uploads a TXT, PDF, or DOCX resume, or pastes resume text manually.
2. The app extracts readable resume text and displays it in an editable text area.
3. The user clicks `Parse Resume` to generate a structured resume preview.
4. The user pastes a target job description.
5. The app generates:

   * JD match scores
   * matched strengths
   * skill gaps
   * ATS-style keywords
   * rewritten resume bullets
   * a tailored cover letter
   * interview preparation questions

## Main Modules

### Resume Parser

Extracts structured resume information including skills, experience, summary, and project highlights.

### JD Match Score

Compares the resume against a target job description and returns match scores, strengths, gaps, and keywords.

### Bullet Rewriter

Rewrites resume bullet points in different tones such as ATS-friendly, concise, technical, or leadership-focused.

### Cover Letter Generator

Generates a tailored cover letter using the resume, job description, company name, and role title.

### Interview Prep

Generates role-specific technical, behavioural, and project-based interview questions with answer hints.

## Local Setup

Clone the repository:

```bash
git clone YOUR_GITHUB_REPO_URL
cd ai-career-assistant-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
```

Run the development server:

```bash
npm run dev
```

Open the app locally:

```txt
http://localhost:3000
```

## Environment Variables

This project requires the following environment variable:

```env
OPENAI_API_KEY=your_openai_api_key
```

Do not commit `.env.local` to GitHub.

## Build

To create a production build:

```bash
npm run build
```

To start the production server locally:

```bash
npm run start
```

## Deployment

The app is deployed on Vercel.

When deploying to Vercel, add the following environment variable in the Vercel project settings:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Limitations

* PDF parsing works best with text-based PDFs.
* Scanned image-based PDFs require OCR and may not extract readable text.
* The AI output depends on the quality and structure of the uploaded resume and job description.
* Generated career advice should be reviewed and edited by the user before use.

## Future Improvements

* Add OCR support for scanned PDFs
* Add DOCX/PDF export for generated cover letters
* Add user authentication and saved application history
* Add more detailed ATS keyword analysis
* Add resume version comparison
* Add downloadable match reports

## Screenshots

Add screenshots here after saving them in a folder such as `/public/screenshots`.

Example:

```md
![Resume Parser](public/screenshots/resume-parser.png)
![JD Match](public/screenshots/jd-match.png)
```

## Author

Built by Stella Fu.
