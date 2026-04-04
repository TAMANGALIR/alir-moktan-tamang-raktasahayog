# Sprint Backlog
**Project**: Raktasahayog – Blood Donation Management & Matching System  
**Sprint**: Sprint 4 – Analytics, Security & Optimization  
**Duration**: 06 Feb 2026 – 13 Apr 2026  
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
Design a graphical Analytics Dashboard for administrators to view system health and donation metrics. Enhance systemic security by enforcing HTTPS via Helmet and tightening Role-Based Access Control logic. Install comprehensive data validation pipelines using Zod, and perform code refactoring to optimize React render performance and PostgreSQL query latency.

## 2. Planned Tasks 
**Sprint 4 – Analytics, Security & Optimization**

| SN | Task | Category | Assignee | Duration |
|---|---|---|---|---|
| S4-01 | Create Prisma aggregations for counting Blood Requests and compiling Donor metrics | Backend | Developer | Day 1–6 |
| S4-02 | Integrate Chart.js/Recharts into React for dynamic graphical visualization | Frontend UI | Developer | Day 7–12 |
| S4-03 | Overhaul input validation integrating strict Zod schemas across all POST APIs | Security | Developer | Day 13–18 |
| S4-04 | Setup Express Helmet for strict transport security headers and XSS mitigation | Security | Developer | Day 19–21 |
| S4-05 | Audit RBAC logic explicitly blocking privilege escalation across Admin routes | DevSecOps| Developer | Day 22–26 |
| S4-06 | Implement React.memo logic preventing unnecessary rendering across components | Refactoring | Developer | Day 27–30 |
| S4-07 | Add database indices to PostgreSQL optimizing geographic/ABO queries | Database | Developer | Day 31–33 |
| S4-08 | Sprint Review updating analytical and security documentation models | Process | PM | Final day |

## 3. Task Status Summary

| Task ID | Description | Status |
|---|---|---|
| S4-01 | DB Aggregation Logics | Completed |
| S4-02 | Admin Recharts Integration | Completed |
| S4-03 | Zod Schema Middleware | Completed |
| S4-04 | Helmet Security Integration | Completed |
| S4-05 | Internal RBAC Audits | Completed |
| S4-06 | Virtual DOM Render Optimization | Completed |
| S4-07 | PostgreSQL Index Mapping | Completed |
| S4-08 | Architectural Documentation | Completed |

## 4. Implementation Summary
### Backend (Node.js, Express, PostgreSQL, Prisma)
Crucial database refactoring resulted in complex aggregated metrics directly resolving statistical JSON mapping without slowing the main event loop. Express routing was fortified utilizing `Helmet` to enforce strict secure transport headers globally. 
*   **Validation**: Implementation of `Zod` logic interceptors immediately halted malformed API payloads from reaching the Prisma ORM layer, severely limiting potential NoSQL/SQL injection vectors.

### Frontend (React + Tailwind CSS)
Complex interactive chart libraries replaced static admin lists. 
*   **Performance Optimization**: Code-base components were audited for redundant state mutations. The application of `useMemo` and `React.memo` effectively stabilized complex rendering trees, dramatically improving Client-side loading matrices. 

## 5. Sprint Outcome
The fourth sprint successfully introduced enterprise-grade analytical views and hardened the security perimeter. The transition to Zod validators guarantees payload integrity, while React refactoring ensures fluid user interface interactions even under heavy load. The Raktasahayog backend is now secure and optimized.

**Carry Forward**: None.
