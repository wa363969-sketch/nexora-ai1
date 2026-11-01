# NEXORA — AI-Powered Productivity & Project Management Platform

> **"Everything You Need to Work Smarter."**

NEXORA is an enterprise-grade SaaS platform combining real-time streaming AI assistance, full-featured agile project management, multi-modal task tracking (Kanban, List, Calendar), team workspaces with role-based access control, database-computed productivity analytics, and automated delivery workflows.

---

## 🚀 Key Platform Features

### 1. Landing Page & Marketing Hub
- **Hero & Value Proposition**: High-impact headlines, animated dashboard perspective preview, floating trust badges.
- **Interactive Feature Showcases**: Deep-dives into AI Co-Pilot, Project Precision, Kanban Task Engine, Collaborative Pods, Workflow Automation, and Live Velocity Analytics.
- **Pricing Matrix**: Starter ($0), Pro ($12/mo), and Enterprise ($39/mo) with annual/monthly toggle.
- **Genuine Testimonials, Accordion FAQ, & Dispatch Newsletter**.

### 2. Intelligent AI Co-Pilot
- **Streaming Token Delivery**: Real-time generative answers via Server-Sent Events (Gemini 2.0 Flash / Pro or OpenAI GPT-4o).
- **Markdown & Code Highlighting**: Syntax rendering, copy response, and regeneration.
- **Task Decomposition**: Converts high-level user stories into prioritized sprint work items and subtasks.
- **Conversation Memory**: Multi-session history, title renaming, and deletion.

### 3. Project Management Portfolio
- **Full CRUD Support**: Create, inspect, update, and delete projects with custom color accents.
- **Calculated Progress**: Progress meters automatically derived from linked task resolution states.
- **Multi-Category & Priority**: Engineering, Design, Operations, Marketing with P0-P3 urgency tags.

### 4. Multi-Modal Task Management & Interactive Kanban
- **Fluid Drag-and-Drop Kanban**: Real-time card reordering between *To Do*, *In Progress*, *In Review*, and *Done*.
- **Task Matrix (List View)**: Expandable task rows with interactive subtask checklists and direct completion toggles.
- **Sprint Calendar**: Month-view deadline schedule highlighting upcoming milestone cutoffs.

### 5. Team Workspaces & Directory
- **Functional Workspace Pods**: Core Engineering, Product Design, AI Research.
- **Role-Based Access Control**: Admins, Lead Architects, Members, and External Guests.
- **Contributor Invitations**: Onboarding modal with email dispatch and status badges.

### 6. Live Database Analytics
- **Zero Fabricated Metrics**: All velocity charts, completion percentages, overdue warnings, and story point throughput are dynamically calculated from real database records.
- **Interactive Recharts**: Multi-axis throughput bar charts, status distribution pie charts, and project progress meters.

### 7. Executive Admin Console
- **User Governance**: Elevate members to administrators or suspend compromised accounts.
- **Resource Quotas**: AI token consumption tracking, storage utilization, and system uptime SLA.
- **System Controls**: Maintenance mode switch, public registration toggle, and AI rate limiting.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling & Design Tokens** | Tailwind CSS v4, Framer Motion, React Icons (`hi2`) |
| **Routing** | React Router v7 (SPA with Protected Routes & Custom 404) |
| **State Management** | Zustand (Sidebar, Command Palette, Active Context) |
| **Backend & Auth** | Appwrite Cloud (Client SDK, Account, Databases, Storage, Avatars) |
| **Intelligence (AI)** | Google Gemini 2.0 Flash / 1.5 Pro & OpenAI GPT-4o API |
| **Data Visualizations** | Recharts (Responsive SVG Charts) |
| **Utilities** | Date-fns, React Markdown, Remark GFM, React Hot Toast |

---

## 💻 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/nexora.git
cd nexora
npm install
```

### 2. Environment Variables Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
# Appwrite Cloud Credentials
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id

# AI API Key (Gemini or OpenAI)
VITE_AI_API_KEY=your_gemini_or_openai_api_key
VITE_AI_PROVIDER=gemini
VITE_AI_MODEL=gemini-2.0-flash
```

> **Note on Zero-Config Mode:** NEXORA includes an intelligent persistent local fallback layer (`dataService.js`). Even before your Appwrite project is created, all pages, CRUD operations, Kanban drag-and-drop, and AI interactions work out-of-the-box!

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄 Appwrite Database Collections Schema

To provision the collections in your Appwrite console:

1. **`users`**
   - `name` (string, 128)
   - `email` (string, 256)
   - `role` (string, 64)
   - `labels` (string array)
2. **`projects`**
   - `name` (string, 128)
   - `description` (string, 2048)
   - `category` (string, 64)
   - `priority` (string, 32)
   - `status` (string, 32)
   - `deadline` (datetime)
   - `teamLead` (string, 128)
   - `color` (string, 16)
3. **`tasks`**
   - `projectId` (string, 64)
   - `projectName` (string, 128)
   - `title` (string, 256)
   - `description` (string, 4096)
   - `priority` (string, 32)
   - `status` (string, 32)
   - `assigneeName` (string, 128)
   - `deadline` (datetime)
   - `subtasks` (string, JSON serialized)
4. **`teams` & `team_members`**
   - `name`, `description`, `lead`, `email`, `role`, `status`
5. **`conversations` & `messages`**
   - `title`, `role`, `content`, `createdAt`
6. **`notifications`**
   - `title`, `message`, `type`, `read`, `createdAt`

---

## ⌨️ Command Palette & Keyboard Shortcuts

- <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>⌘</kbd> + <kbd>K</kbd>): Open Command Palette anywhere
- <kbd>↑</kbd> / <kbd>↓</kbd>: Navigate through quick jump commands
- <kbd>Enter</kbd>: Execute action or navigate
- <kbd>Esc</kbd>: Dismiss overlay

---

## 🚢 Vercel Deployment Instructions

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete NEXORA SaaS platform"
   git push origin main
   ```
2. Import project in [Vercel Dashboard](https://vercel.com/new).
3. Set Framework Preset to **Vite**.
4. Add your Environment Variables (`VITE_APPWRITE_PROJECT_ID`, `VITE_AI_API_KEY`, etc.).
5. Deploy! (Single Page Application routing is pre-configured in `vercel.json`).

---

## 📋 Comprehensive 23-Page Verification Checklist

- [x] **1. Landing Page** (`/`): Navbar, Hero, Preview, AI, Projects, Tasks, Teams, Automation, Analytics, Pricing, Testimonials, FAQ, Newsletter, Footer.
- [x] **2. Login** (`/login`): Appwrite email/password authentication with password visibility toggle.
- [x] **3. Registration** (`/register`): Account signup with validation and password confirmation.
- [x] **4. Forgot Password** (`/forgot-password`): Recovery link dispatch flow.
- [x] **5. Main Dashboard** (`/dashboard`): 4 live KPI counters, quick AI prompt bar, active projects, priority tasks.
- [x] **6. AI Assistant** (`/ai-assistant`): Real-time chat, Markdown code highlighting, model selector, copy/regenerate.
- [x] **7. Projects** (`/projects`): Grid/List toggle, search, category filter, create/edit modal.
- [x] **8. Project Details** (`/projects/:id`): Scope overview, calculated progress bar, task backlog, add task modal.
- [x] **9. Tasks** (`/tasks`): Multi-filter matrix, expandable subtasks checklist, status toggles.
- [x] **10. Kanban Board** (`/kanban`): Drag-and-drop card columns, directional step buttons, quick create.
- [x] **11. Calendar** (`/calendar`): Month grid, deadline markers, day agenda drawer.
- [x] **12. Team Workspace** (`/teams`): Pod cards, member counts, lead assignment, create team modal.
- [x] **13. Team Members** (`/team-members`): Contributor directory, role badges, invitation modal, removal.
- [x] **14. Analytics** (`/analytics`): Database-derived Recharts charts (weekly throughput, status pie, completion meters).
- [x] **15. Notifications** (`/notifications`): Unread filter, mark as read, mark all read.
- [x] **16. User Profile** (`/profile`): Display name update, avatar trigger, verified credential badges.
- [x] **17. Account Settings** (`/settings`): Security password change, AI model preference, diagnostics.
- [x] **18. Subscription Plans** (`/subscriptions`): Pro quota consumption meters, tier switching.
- [x] **19. Admin Dashboard** (`/admin`): Root governance, role promotion/demotion, suspension, system toggles.
- [x] **20. Help Center** (`/help`): Implementation guides, search input, support contact CTA.
- [x] **21. Privacy Policy** (`/privacy`): Data sovereignty, zero AI training guarantees.
- [x] **22. Terms and Conditions** (`/terms`): SaaS subscription and acceptable use terms.
- [x] **23. Custom 404 Page** (`/nonexistent`): Animated 404 visual with navigation shortcuts.

---

© 2024 NEXORA Inc. All rights reserved.
