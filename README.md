# 💼 JobOne — Premium AI-Powered Job Portal & ATS

JobOne is a state-of-the-art, double-sided career marketplace and Applicant Tracking System (ATS). It connects job seekers with employers through highly responsive, premium interfaces, deep AI integrations, and location-based job discovery.

---

## 🚀 Key Features

### 🤖 AI Capabilities (Powered by Google Gemini & Vercel AI SDK)
* **ATS Resume Parser:** Upload resumes in PDF/DOCX formats to automatically extract contact details, skills, experiences, education, and projects, which directly populates the candidate's profile.
* **Smart Job Recommender:** Suggests the top 5 matching roles with match scores (0-100%) and explanatory reasoning based on candidate skills, bio, and experience.
* **AI Job Description Generator:** Enables recruiters to generate detailed summaries, roles & responsibilities, and screening questions instantly by entering job criteria.
* **Conversational AI Chatbot:** A live widget helper assisting candidates in finding active jobs in real-time, executing database queries, and summarizing jobs.

### 👤 For Candidates / Job Seekers
* **Interactive Map Discovery:** Discover jobs close to your location with Leaflet maps.
* **Comprehensive Dashboards:** Monitor active job search status, view recommendations, and trace the lifecycle of applications.
* **Google OAuth & OTP Verification:** Register securely with Gmail or standard email verified with OTPs dispatched via the Brevo API.
* **AWS S3 Document Locker:** Seamlessly upload and manage resumes through secure AWS S3 pre-signed URLs.

### 🏢 For Employers / Recruiters
* **Bespoke Job Posting:** Post openings with screening questions, custom categories, salary ranges, and custom layouts.
* **Rich Text Editing:** Edit details using integrated WYSIWYG editors (`react-simple-wysiwyg`).
* **Candidate Sourcing:** Perform advanced semantic queries on all profiles.
* **Application Lifecycle (ATS):** Update statuses (Under Review, Interviewing, Offered, Rejected), view responses, and download resumes.
* **Profile Verification:** Upload official documentation to AWS S3 for admin review to get verified badge.

### 👑 For Administrators (Admin Portal)
* **Central Dashboard:** Monitor site metrics, registered users, jobs posted, and verification files.
* **Badges & Moderation:** Verify employers, manage postings, and freeze/unfreeze accounts for compliance.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React (v19), Vite, Tailwind CSS (v4), Framer Motion, React Router DOM, Leaflet, Swiper, Lucide React, Axios |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Google Generative AI (Gemini SDK), Vercel AI SDK, Brevo API, AWS SDK (S3 Client & Pre-signer), JWT, Bcrypt, Firebase Admin |
| **Document Processing** | `pdf-parse` (PDF processing), `mammoth` (Word document parser) |

---

## 📂 Project Structure

```text
Jobone/
├── backend/                  # Node.js + Express API Backend
│   ├── configs/              # Mongoose DB connector
│   ├── controllers/          # Business logic (AI, Users, Employers, Admin, Jobs)
│   ├── middleware/           # Auth validation, Error handling
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # Express endpoints router
│   ├── utils/                # Brevo Email integrations & helper tools
│   ├── index.js              # Server entrypoint
│   └── package.json          # Node dependencies & engines
│
├── frontend/                 # React SPA Frontend
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── assets/           # Client-side media & illustrations
│   │   ├── components/       # Reusable blocks (Hero, Navbar, ChatWidgets, etc.)
│   │   ├── pages/            # View pages (dashboards, register, profile)
│   │   ├── routes/           # Private and Public routes
│   │   ├── App.jsx           # Client router configuration
│   │   ├── main.jsx          # Client entrypoint
│   │   └── index.css         # Global Tailwind CSS configurations
│   ├── vite.config.js        # Vite compilation configuration
│   └── package.json          # React dependencies & scripts
```

---

## ⚙️ Setup & Installation

### Prerequisites
* Node.js (v18+)
* MongoDB Instance (Atlas or Local)
* AWS S3 Bucket
* Google Gemini API Key
* Brevo API Key
* Google OAuth Client ID

### 1. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the root of the `backend` folder:
```env
PORT=5000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobone
JWT_SECRET=your_jwt_signing_key_here

# AI Integrations
GEMINI_API_KEY=your_gemini_api_key_here

# AWS S3 Storage Configs
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_BUCKET_REGION=your_s3_bucket_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Email/Verification Service (Brevo API)
BREVO_API_KEY=your_brevo_api_key
EMAIL_USERNAME=sender_email_registered_on_brevo@gmail.com

# Google Authentication
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### 2. Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Verify that the API requests point to the backend URL. You can check API configurations in `frontend/src/` (the client is configured to connect to your deployed backend or `http://localhost:5000` depending on the environment setup).

---

## 🏃 Running the Application

To run the application locally, start both the backend and frontend servers:

### Start Backend:
```bash
cd backend
# Runs on Port 5000 by default (uses nodemon if dev dependencies are installed)
npm run dev # or node index.js
```

### Start Frontend:
```bash
cd frontend
# Starts the Vite development server (usually http://localhost:5173)
npm run dev
```

---

## 🔒 Security & Best Practices
* **Pre-signed URLs:** Resumes and employer verification documents are securely processed using AWS pre-signed URLs with short expirations to prevent unauthorized document exposure.
* **CORS Protection:** Express application restricts API requests to registered origins.
* **Secure OTP Lifecycle:** OTPs generated are time-sensitive (10-minute expiry) and destroyed immediately upon use.
* **Dual Roles:** Candidate and Employer environments are separated by discrete JWT verification middlewares.
