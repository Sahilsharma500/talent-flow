# TalentFlow

TalentFlow is an HR management frontend application that allows teams to manage jobs, candidates, and assessments. The app uses a **simulated backend** via **MSW** and **Dexie (IndexedDB)** to persist data locally.

---

## 🟦 Jobs Flow

The **Jobs Flow** in TalentFlow allows HR teams to manage job postings efficiently. Even though this is a frontend-only app, a **simulated backend** is implemented using **MSW** and **Dexie (IndexedDB)** to persist data locally.

### 1️⃣ Backend Simulation

- **Database:**  
  - `JobsDB` (Dexie) with a `jobs` table storing job details.  
  - Each job has:

    ```json
    {
      "id": "job-1",
      "title": "Frontend Developer",
      "slug": "frontend-developer-1a2b",
      "status": "active",
      "tags": ["React", "JavaScript"],
      "order": 0,
      "description": "Job description text...",
      "requirements": ["Req1", "Req2"],
      "salary": "$50K - $120K",
      "location": "City, State",
      "jobType": "Full-time",
      "createdAt": "2024-05-20T12:00:00.000Z"
    }
    ```

- **Seed Data:**  
  - 25 jobs generated using Faker with realistic titles, tags, and locations.  
  - Mixed `active` and `archived` statuses.

- **MSW Handlers (Endpoints):**  
  - `GET /jobs` – fetch list with pagination, filters, search  
  - `GET /jobs/:id` – fetch single job details  
  - `POST /jobs` – create a new job  
  - `PATCH /jobs/:id` – edit job  
  - `PATCH /jobs/:id/reorder` – reorder jobs (optimistic updates with rollback)  
  - `DELETE /jobs/:id` – remove job

- **Latency & Error Simulation:**  
  - Artificial delay: **200–1200ms** using `delay()`  
  - Random errors on write operations (~8% chance) using `maybeFail()`  
  - Simulated network errors (timeout, server overload, internal error)

- **Persistence:**  
  - All job data stored in **IndexedDB** via Dexie.  
  - State is restored automatically on page refresh.

### 2️⃣ Frontend Features

1. **Jobs List**  
   - Displays jobs with pagination, search, and filters (status, job type).  
   - Drag-and-drop to reorder jobs with **optimistic UI updates**.

2. **Job Create / Edit**  
   - Create or edit via a modal or route.  
   - Validations: **title required**, **unique slug**.

3. **Archive / Unarchive Jobs**  
   - Toggle between `active` and `archived` status.  
   - Archived jobs visually distinguished.

4. **Delete Job**  
   - Delete confirmation modal prevents accidental removal.

5. **Deep Linking**  
   - `/jobs/:id` shows **job details** including:  
     - Description  
     - Requirements  
     - Tags  
     - Job type, location, salary  
     - Number of applications (fetched from candidates)  
   - Manage candidates button navigates to `/jobs/:id/candidates`.

6. **Reordering Jobs**  
   - Drag-and-drop implemented using `onDragStart`, `onDragOver`, `onDrop`.  
   - Backend updates order via `/jobs/:id/reorder` endpoint.  
   - Rollback occurs on simulated API failure.

7. **UI/UX**  
   - Clean Tailwind CSS styling with hover states, animations, and responsive design.  
   - Empty state messages for no jobs matching filters.  
   - Pagination controls with previous/next and page numbers.

---

## 🟦 Candidate Flow

The **Candidate Flow** in TalentFlow allows HR teams to manage applicants and track their progress across job stages. Like Jobs Flow, it uses **MSW** and **Dexie** for frontend simulation and persistence.

### 1️⃣ Backend Simulation

- **Database:**  
  - `CandidatesDB` (Dexie) with a `candidates` table storing candidate details.  
  - Each candidate has:

    ```json
    {
      "id": "cand-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "jobId": "job-1",
      "stage": "Applied",
      "notes": [
        {
          "id": "note-1",
          "text": "Candidate referred by Jane",
          "mentions": ["Jane Doe"],
          "createdAt": "2024-05-21T10:00:00.000Z"
        }
      ],
      "resume": "link/to/resume.pdf",
      "appliedAt": "2024-05-20T12:30:00.000Z"
    }
    ```

- **Seed Data:**  
  - 50 candidates generated using Faker with realistic names, emails, and job associations.  
  - Candidates spread across multiple stages: `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`.

- **MSW Handlers (Endpoints):**  
  - `GET /candidates?jobId=:id` – fetch all candidates for a job  
  - `GET /candidates/:id` – fetch single candidate details  
  - `POST /candidates` – create a new candidate  
  - `PATCH /candidates/:id` – update candidate info  
  - `PATCH /candidates/:id/stage` – move candidate between stages (with optimistic updates)  
  - `DELETE /candidates/:id` – remove candidate

- **Latency & Error Simulation:**  
  - Artificial delay: **150–1000ms**  
  - Random write errors (~10% chance)  
  - Simulated network errors (timeout, internal error)

- **Persistence:**  
  - All candidate data stored in **IndexedDB** via Dexie.  
  - Notes, stage changes, and job associations persist across refresh.

### 2️⃣ Frontend Features

1. **Candidates List**  
   - Table view with search, filter, and pagination.  
   - Filter by stage, applied job, or name/email.  
   - Virtualized list for performance with large data.

2. **Candidate Details**  
   - `/candidates/:id` route shows:  
     - Personal info (name, email, phone)  
     - Resume link  
     - Current stage and history timeline  
     - Notes with `@mentions`  

3. **Add / Edit Candidate**  
   - Form validation: name, email, and associated job required.  
   - Add notes with live mention suggestions.

4. **Stage Management**  
   - Move candidates between stages via dropdown or **Kanban drag-and-drop**.  
   - Optimistic updates with rollback on simulated failure.

5. **Notes & Mentions**  
   - Each note supports mentions of team members.  
   - Notes stored with timestamps for activity tracking.

6. **Kanban Board**  
   - `/jobs/:id/candidates` route displays candidates by stage:  
     - `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`  
   - Drag-and-drop cards to change stage.  
   - Stage counts displayed at top of each column.

7. **UI/UX**  
   - Tailwind CSS styling with hover effects, responsive design, and smooth animations.  
   - Empty state messages when no candidates exist for a job.  
   - Quick actions for editing, notes, and moving stages.

---

## 🟦 Assessment Flow

The **Assessment Flow** allows HR teams to create and manage assessments for each job, with a live preview and candidate responses.

### 1️⃣ Backend Simulation

- **Database:**  
  - `AssessmentsDB` (Dexie) storing assessments linked to jobs.  
  - Each assessment contains:

    ```json
    {
      "id": "assessment-job-1",
      "jobId": "job-1",
      "title": "Assessment for Frontend Developer",
      "description": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Section 1",
          "questions": [
            {
              "id": "q1",
              "type": "single-choice",
              "question": "Do you know React?",
              "required": true,
              "options": ["Yes", "No"],
              "validation": null,
              "conditionalOn": null
            }
          ]
        }
      ],
      "createdAt": "2024-05-22T10:00:00.000Z"
    }
    ```

- **MSW Handlers (Endpoints):**  
  - `GET /assessments/:jobId` – fetch assessment for a job  
  - `POST /assessments` – save or update an assessment

- **Persistence:**  
  - Assessment state and candidate responses stored in **IndexedDB**.  
  - Responses are also saved locally via `localStorage`.

### 2️⃣ Frontend Features

1. **Assessment Builder**  
   - Create assessments per job.  
   - Add multiple **sections**.  
   - Add questions with types:  
     - Single Choice, Multi Choice  
     - Short Text, Long Text  
     - Numeric (with min/max)  
     - File Upload (stub)  
   - Set required questions and validation rules.  
   - Conditional logic: show questions based on previous answers.  

2. **Live Preview Pane**  
   - Render the assessment as a fillable form.  
   - Test validation rules and conditional questions.  
   - Save responses locally (`localStorage`) for testing.

3. **UI/UX**  
   - Two-pane interface: Builder & Live Preview.  
   - Sections and questions editable inline.  
   - Options and validations managed dynamically.  
   - Tailwind CSS with responsive design and hover states.

4. **Form Runtime Validation**  
   - Required fields  
   - Numeric range checks  
   - Maximum length for text fields  
   - Conditional questions shown only when conditions are met

5. **Persistence & Navigation**  
   - Save assessment to backend simulation via API.  
   - Navigate between job assessments and main dashboard.  

---

## 🟦 Analytics Flow

The **Analytics Flow** provides HR teams with a dashboard to track key metrics and make data-driven decisions. This is an additional feature implemented for enhanced insights.

### 1️⃣ Backend Simulation

- **Database:**  
  - `AnalyticsDB` (Dexie) with:
    - `monthlyData` – stores total applicants, hired/rejected candidates, daily applicants, and job-wise data per month.
    - `jobs` – stores job details for analytics and comparisons.

- **Seed Data:**  
  - Monthly analytics for the last 6 months generated using Faker.  
  - Daily applicants simulated per month.  
  - Job-wise applicant counts for comparison charts.  
  - 5 sample jobs for analytics reporting.

- **MSW Handlers (Endpoints):**  
  - `GET /dashboard` – basic endpoint to prevent warnings  
  - `GET /analytics/monthly` – fetch monthly summary of applicants, hires, and rejections  
  - `GET /analytics/daily-applicants/:monthKey` – fetch daily applicants for a month  
  - `GET /analytics/candidates-per-job` – total applicants per job  
  - `GET /analytics/jobs-for-comparison` – fetch jobs list for comparison charts  
  - `GET /analytics/job-comparison/:month1/:month2` – fetch applicants comparison between two months

- **Persistence:**  
  - Analytics data stored in **IndexedDB** via Dexie.  
  - Reinitializable in development via `window.reinitializeAnalytics()`.

### 2️⃣ Frontend Features

1. **Dashboard Overview**  
   - Key metrics cards:  
     - Total Applicants  
     - Candidates Hired  
     - Rejected Candidates  
     - Total Jobs  
   - Each card shows month-over-month change (increase/decrease).

2. **Daily Applicants Line Chart**  
   - Shows number of applicants per day for a selected month.  
   - Interactive line chart using **Recharts**.

3. **Candidates Per Job Pie Chart**  
   - Displays distribution of applicants across jobs.  
   - Color-coded segments with tooltips.

4. **Job-wise Applicant Comparison**  
   - Compare applicant counts between two months for all jobs.  
   - Interactive bar chart with month selection dropdowns.

5. **UI/UX**  
   - Tailwind CSS styling with responsive grid layouts, hover states, and animations.  
   - Loading skeletons while fetching analytics data.  
   - Fully responsive and visually consistent with other TalentFlow flows.

6. **Additional Notes**  
   - This flow is frontend-only and uses **MSW + Dexie** to simulate backend behavior.  
   - Designed for HR decision-making and performance tracking.

---

