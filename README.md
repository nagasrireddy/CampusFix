# CampusFix

A production-quality, 3-portal MERN web application for automating technical
and infrastructure issue reporting on a college campus.

## Portals & Roles

| Role       | Capabilities                                                                 |
|------------|-------------------------------------------------------------------------------|
| Student    | Submit tickets with photo/video proof, track status via a visual timeline     |
| Admin      | View all tickets, triage priority, assign technicians, monitor KPI metrics    |
| Technician | Mobile-friendly personal queue, move tickets to In Progress / Resolved        |

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, React Hook Form
- **Backend:** Node.js, Express.js (thin controllers / service-oriented structure)
- **Database:** MongoDB Atlas via Mongoose
- **Media:** Multer + Cloudinary (student-uploaded proof images/videos)
- **Auth:** JWT + bcrypt, enforced with role-based middleware on every sensitive route

## Project Structure

```
campusfix/
├── backend/
│   ├── config/          # DB + Cloudinary/Multer configuration
│   ├── models/          # Mongoose schemas (User, Ticket)
│   ├── middleware/       # auth (JWT), roleCheck (RBAC), upload, error handling
│   ├── controllers/      # Business logic per resource
│   ├── routes/           # Express route definitions
│   ├── utils/             # Token generation, express-validator rule sets
│   └── server.js          # App entry point
└── frontend/
    └── src/
        ├── api/            # Axios instance with JWT interceptor
        ├── context/        # AuthContext (global session state)
        ├── utils/           # Namespaced localStorage wrapper (storage.js)
        ├── components/      # Navbar, badges, TicketCard, ProtectedRoute, etc.
        └── pages/
            ├── student/     # Dashboard, NewTicket, TicketTimeline
            ├── admin/       # AdminDashboard, AssignTicket
            └── technician/  # TechnicianQueue
```

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, JWT secret, and Cloudinary credentials
npm run dev
```

The API will run on `http://localhost:5000` by default.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run on `http://localhost:5173` and proxy `/api` calls to the
backend automatically (see `vite.config.js`).

### 3. Required Environment Variables (backend/.env)

| Variable                 | Description                                      |
|---------------------------|---------------------------------------------------|
| `MONGO_URI`               | MongoDB Atlas connection string                   |
| `JWT_SECRET`               | Long random string used to sign JWTs              |
| `JWT_EXPIRES_IN`          | Token lifetime, e.g. `7d`                          |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary account cloud name                      |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                                 |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                              |
| `CLIENT_ORIGIN`           | Allowed CORS origin(s), comma-separated            |

## Security Notes

- **RBAC enforcement is layered:** the frontend hides UI a role shouldn't see
  (`ProtectedRoute`), but the *authoritative* checks live in the backend
  (`middleware/auth.js` + `middleware/roleCheck.js`) on every route. Only an
  admin can call `PATCH /tickets/:id/assign` (mutates `technicianId`); only
  the assigned technician or an admin can push a ticket's `status` to
  `Resolved`.
- **Session isolation:** all browser storage goes through
  `frontend/src/utils/storage.js`, which namespaces JWTs/user data by role
  and purges any other role's residual session data on every login,
  preventing cross-role data leakage on shared campus computers.
- **Passwords** are bcrypt-hashed (cost factor 12) and never returned by any
  API response.
- **Input validation** is enforced server-side with `express-validator` on
  every mutating route, in addition to client-side React Hook Form checks.

## Design Language

The UI intentionally avoids glassmorphism/transparency entirely. Every
surface (cards, forms, dashboards, badges) uses solid, opaque backgrounds
defined in `tailwind.config.js` for maximum text contrast and readability in
both light and dark themes.
