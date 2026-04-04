# Sprint Backlog
**Project**: Raktasahayog – Blood Donation Management & Matching System  
**Sprint**: Sprint 1 – System Setup & User Management  
**Duration**: 31 Oct 2025 – 03 Dec 2025  
**Context**: Final Year Project (FYP)  
**Stack**: React, Node.js, Express, PostgreSQL, Prisma, JWT, Tailwind CSS  

## Table of Contents
1. [Sprint Goal](#1-sprint-goal)
2. [Planned Tasks](#2-planned-tasks)
3. [Task Status Summary](#3-task-status-summary)
4. [Implementation Summary](#4-implementation-summary)
5. [Sprint Outcome](#5-sprint-outcome)

---

## 1. Sprint Goal
To set up the complete development environment and core user management foundation for Raktasahayog. This includes configuring the project workspace in VS Code, designing the relational database schema with Prisma, performing initial migrations to PostgreSQL, and implementing secure user registration, login, and role-based access control for Admin, Donor, and Recipient users. By the end of Sprint 1, all core auth flows (sign up, sign in, role-based authorization) must be working end-to-end via APIs with validated data persisted in the database.

## 2. Planned Tasks 
**Sprint 1 – System Setup & User Management**

| SN | Task | Category | Assignee | Duration |
|---|---|---|---|---|
| S1-01 | Initialize monorepo / workspace in VS Code; configure Node, React, and shared .editorconfig | Setup | Developer | Day 1 |
| S1-02 | Set up backend Node.js + Express project structure (src/routes, controllers, services, prisma) | Backend Setup | Developer | Day 1–2 |
| S1-03 | Install and configure Prisma ORM with PostgreSQL connection string | Database / ORM | Developer | Day 2 |
| S1-04 | Design ERD and define Prisma schema for User, Role, DonorProfile, RecipientProfile | Database Design | Developer | Day 3–4 |
| S1-05 | Run initial Prisma migrations and seed default roles (Admin, Donor, Recipient) | Database Migration | Developer | Day 4 |
| S1-06 | Implement user registration API with validation (name, email, phone, password, role) | Auth API | Developer | Day 5–6 |
| S1-07 | Implement secure password hashing and JWT token generation | Security/Auth | Developer | Day 6 |
| S1-08 | Implement login API with JWT-based authentication and error handling | Auth API | Developer | Day 6–7 |
| S1-09 | Implement middleware for JWT verification and role-based access control (RBAC) | Security / Middleware | Developer | Day 7–8 |
| S1-10 | Set up basic frontend React app shell and Tailwind CSS; connect to auth APIs | Frontend Setup | Developer | Day 8–9 |
| S1-11 | Build Login and Registration pages UI for Donor and Recipient flows | Frontend UI | Developer | Day 9–10 |
| S1-12 | Create simple Admin panel UI shell for managing users (view list, basic filters placeholder) | Frontend UI | Developer | Day 10–11 |
| S1-13 | Configure environment variables for DB, JWT secret, and CORS (dev vs prod) | Configuration | Developer | Day 11 |
| S1-14 | Implement API-level validation and error responses (Zod / Joi or custom validation) | Backend Validation | Developer | Day 12–13 |
| S1-15 | Manual QA: test registration/login flows for all roles, token expiry, and unauthorized access paths | QA | Developer | Day 14–15 |
| S1-16 | Sprint review & retrospective; document Sprint 1 outcomes and technical decisions | Process / Documentation | Developer | Final day of sprint |

## 3. Task Status Summary

| Task ID | Description | Status |
|---|---|---|
| S1-01 | VS Code workspace initialization & tooling configuration | Completed |
| S1-02 | Express backend project structure setup | Completed |
| S1-03 | Prisma + PostgreSQL connection configuration | Completed |
| S1-04 | Prisma schema and ERD for User, Role, Donor, Recipient | Completed |
| S1-05 | Initial migrations and seeding of default roles | Completed |
| S1-06 | User registration API with validation | Completed |
| S1-07 | Password hashing and JWT token generation | Completed |
| S1-08 | Login API with JWT-based authentication | Completed |
| S1-09 | JWT auth middleware and role-based access control (Admin/Donor/Recipient) | Completed |
| S1-10 | Frontend React shell setup with Tailwind and API integration base | Completed |
| S1-11 | Login & Registration UI for Donor and Recipient | Completed |
| S1-12 | Admin panel shell UI for basic user management | Completed |
| S1-13 | Environment variables, CORS, and config separation | Completed |
| S1-14 | Centralized validation and standardized error responses | Completed |
| S1-15 | Manual QA for auth scenarios and unauthorized access | Completed |
| S1-16 | Sprint review, documentation of architecture & decisions | Completed |

## 4. Implementation Summary
### Backend (Node.js, Express, PostgreSQL, Prisma)
The backend was structured under a modular `src` layout separating routes, controllers, services, middleware, and prisma. Prisma was configured as the ORM with a PostgreSQL database. The schema defines `User` entities with associated `Role` records and optional `DonorProfile` / `RecipientProfile` tables for extended attributes (blood group, location, medical flags). Prisma migrations were executed to create the schema and seed default roles (Admin, Donor, Recipient).
*   **Authentication & Authorization**: Registration and login endpoints were implemented using Express. Passwords are hashed (e.g., bcrypt) before storage. Upon successful login, the API issues a signed JWT containing user ID and role claims.
*   **Security Middleware**: A JWT verification middleware protects private routes, while a role-based guard ensures that only appropriate roles access sensitive resources (e.g., admin-only management routes, donor-specific operations).
*   **Validation & Error Handling**: Request payloads are validated (e.g., via Zod/Joi or custom validators) with consistent error response formats. Common error cases (duplicate email, invalid credentials, missing token, forbidden role) are covered.

### Frontend (React + Tailwind CSS)
A minimal React frontend was initialized to support user-facing auth screens. Global styling is handled by Tailwind CSS with a base theme suitable for a healthcare/blood donation context (clean, high-contrast palette and accessible typography).
*   **Auth Screens**: Dedicated Login and Registration pages were built for donors and recipients, using form components wired to the backend auth APIs. Validation messages and API errors are surfaced in the UI.
*   **Admin Shell**: A basic Admin layout was created with a navigation sidebar and placeholder table section for user lists and filters. Integration with actual management APIs is planned for subsequent sprints.
*   **API Integration**: A shared Axios/fetch wrapper handles base URLs and attaches the JWT token from local storage to authenticated requests.

## 5. Sprint Outcome
Sprint 1 was successfully completed. All planned system setup and user management tasks were delivered within the defined sprint window. The Raktasahayog platform now has a stable backend foundation with a normalized relational schema, fully functional authentication flows (register, login) for Admin, Donor, and Recipient roles, and robust JWT-based authorization middleware. A basic frontend shell provides working login and registration interfaces plus an Admin dashboard scaffold, enabling secure access for different user categories.

**Carry Forward**: None – all Sprint 1 backlog items were completed.

The codebase is now ready for Sprint 2 – Donation & Blood Request Management, where donor profiles, request creation, and tracking features will be built on top of this user management foundation.
