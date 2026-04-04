# Feature Work Evidence
## Raktasahayog – Blood Donation Management & Matching System

**Sprint**: Sprint 0 – Project Initiation & Planning  
**Duration**: 01 Oct 2025 – 30 Oct 2025  
**Document Type**: Implementation Evidence  

---

## 1. Table of Contents
1. Table of Contents
2. UI/UX Pages
3. Database Schema References
4. Code Snippet Excerpts
   - 4.1 Backend – Initial `package.json` Setup
   - 4.2 Shared – Prettier Code Formatter Config
5. Explanation of Implemented Logic
6. Real Output Evidence

---

## 2. UI/UX Pages
During Sprint 0, the React application was not yet coded, but the entire architectural flow and design systems were structured perfectly in Figma. The core color themes emphasizing medical safety (Red/White palettes) and accessibility constraints were locked in. The wireframes provide the explicit foundation for the upcoming Sprint 1 React components.

* Figure 1: Global Design System & Component Library (Figma)
<br/>*[Placeholder for Figma Component Overview]*

* Figure 2: Donor Registration Wireframe
<br/>*[Placeholder for Registration Figma Sketch]*

* Figure 3: Emergency SOS Blood Request Wireframe
<br/>*[Placeholder for SOS Popup Sketch]*

---

## 3. Database Schema References
Initial theoretical Entity Relationship Diagrams (ERD) were mapped out on Draw.io. The models define strict relational mappings optimized for PostgreSQL handling 1-to-N relationships between Users and Blood Requests securely.

* Figure 4: Draw.io Relational ERD
<br/>*[Placeholder for Database ERD Image]*

---

## 4. Code Snippet Excerpts

### 4.1 Backend – Initial `package.json` Setup
`backend/package.json`
```json
{
  "name": "raktasahayog-backend",
  "version": "1.0.0",
  "description": "Blood Donation Management System API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "npx prisma migrate dev"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "prisma": "^5.7.1",
    "zod": "^3.22.4"
  }
}
```
* Figure 5: Backend NPM Initialization

### 4.2 Shared – Prettier Code Formatter Config
`.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```
* Figure 6: Prettier shared rules enforcing uniform styling

---

## 5. Explanation of Implemented Logic
* **Monorepo Architecture Analysis**: Decided to isolate the frontend React client and Express backend into distinct workspaces to simplify deployment via Vercel (Frontend) and Render/Heroku (Backend).
* **Database Selection Strategy**: PostgreSQL was chosen over MongoDB strictly to ensure ACID transaction compliance preventing data anomalies during high-stakes Donor-Recipient matches.
* **UI/UX Strategy**: Figma components utilize strict variants establishing unified Button hovering states, easing the translation into Tailwind CSS utility classes in subsequent sprints.

---

## 6. Real Output Evidence

| Feature | Evidence | Result |
|---|---|---|
| SRS Documentation | Finished Word Document finalized by PM | ✅ Confirmed |
| Visual Wireframes | Figma URLs active covering Registration to Dispatch | ✅ Confirmed |
| Tooling Configuration | Local `package.json` initialized confirming MERN stack | ✅ Confirmed |
| Database ERD | Draw.io mapping confirming 3NF Form structural integrity | ✅ Confirmed |
