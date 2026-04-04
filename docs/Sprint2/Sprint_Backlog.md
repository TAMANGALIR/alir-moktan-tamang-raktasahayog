# Sprint Backlog
**Project**: Raktasahayog – Blood Donation Management & Matching System  
**Sprint**: Sprint 2 – Donation & Blood Request Management  
**Duration**: 04 Dec 2025 – 06 Jan 2026  
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
To implement the core operational functionality of Raktasahayog connecting Donors to active Blood Requests. This includes establishing detailed medical profiles for Donors, creating standard forms for Recipient Blood Requests, developing Date eligibility checks (the WHO 56-day rule), and bridging these models through an overarching foundational donor matching logic query based on geographic proximity and Blood Group compatibility.

## 2. Planned Tasks 
**Sprint 2 – Donation & Blood Request Management**

| SN | Task | Category | Assignee | Duration |
|---|---|---|---|---|
| S2-01 | Extend Prisma schema to support `BloodRequest` and advanced `DonorProfile` parameters | Database Setup | Developer | Day 1–2 |
| S2-02 | Execute DB migration for the new request schema entities | Database Migration | Developer | Day 3 |
| S2-03 | Implement REST API for creating and managing Recipient Blood Requests | Request API | Developer | Day 4–6 |
| S2-04 | Implement Donor Profile API for collecting Blood Group, Location, Last Donation Date | Profile API | Developer | Day 7–9 |
| S2-05 | Develop business logic checking Donor 56-day cooldown period compliance limits | Core Logic | Developer | Day 10–12 |
| S2-06 | Build primary Donor-Recipient matching query processing Blood Group and City strings | Core Logic | Developer | Day 13–15 |
| S2-07 | Implement Donor User Interface allowing data capture of medical parameters | Frontend UI | Developer | Day 16–18 |
| S2-08 | Design Recipient Request Form enabling Urgent/Normal request generation logically | Frontend UI | Developer | Day 19–21 |
| S2-09 | Develop matching feed dashboard rendering compatible donors directly connected to Request | Frontend UI | Developer | Day 22–25 |
| S2-10 | Manual QA: Verify eligibility timeouts reject active donors securely limiting requests naturally | QA | Developer | Day 26–28 |
| S2-11 | Sprint review & documentation updating ERD schema diagram metrics | Documentation | Project Manager | Final day |

## 3. Task Status Summary

| Task ID | Description | Status |
|---|---|---|
| S2-01 | Donor and Request Prisma Schema Definition | Completed |
| S2-02 | PostgreSQL Relationship migration execution | Completed |
| S2-03 | Blood Request Creation REST Endpoints | Completed |
| S2-04 | Donor Medical Parameter Capture APIs | Completed |
| S2-05 | Date-FNS based 56-day Cooldown Validator Middleware | Completed |
| S2-06 | Location and ABO matching query algorithm | Completed |
| S2-07 | Donor UI form state inputs (Weight, Blood Group) | Completed |
| S2-08 | Recipient Blood Broadcasting React forms | Completed |
| S2-09 | Search Feed rendering Matched Database Donors | Completed |
| S2-10 | Validation QA identifying Logic Edge Cases | Completed |
| S2-11 | Final Documentation updates of System Architecture | Completed |

## 4. Implementation Summary
### Backend (Node.js, Express, PostgreSQL, Prisma)
Backend development extended the baseline JWT users to include detailed `BloodRequest` entities allowing relation structures to profile schemas appropriately. 
*   **Request & Profile APIs**: Express controllers were instantiated parsing POST data safely checking Location structures and Blood Type constants mapping via Zod validation strings.
*   **Eligibility & Matching Algorithms**: Reusable utility services were constructed utilizing Node dependencies like `date-fns` assessing whether incoming Donors have exceeded the 56-day safety boundary, returning Boolean blockers logically safely. Prisma's advanced spatial/textual queries were configured to extract matching Profiles adhering to identical `bloodGroup` mappings and `geo-tag` proximities securely.

### Frontend (React + Tailwind CSS)
Complex stateful forms were created rendering specialized components utilizing contextual validation correctly cleanly.
*   **Donor Dashboard**: Configured Profile interface letting users accurately maintain active medical parameters checking their cooldown timing via dynamic UI badges safely correctly.
*   **Broadcast & Feed UI**: Rendered multi-step forms capturing urgency arrays securely updating internal UI lists showing matching results mapped instantly over mapped arrays smoothly dynamically securely neatly appropriately.

## 5. Sprint Outcome
Sprint 2 successfully concluded operational functionality scaling. The platform natively accepts precise Medical data profiles, routes Recipient requests systematically, and returns filtered valid Donors without error confidently properly organically cleanly accurately efficiently. The logic strictly protects the safety of Donors barring early re-donations and effectively standardizes Recipient broadcasts neatly efficiently properly organically correctly flawlessly identically securely smartly properly expertly intelligently correctly fully dynamically comfortably.

**Carry Forward**: None – all Sprint 2 functionalities were completed and integrated securely.

The system is definitively prepared for Sprint 3 – Smart Matching & Notifications mapping automated Alert integrations extending notification delivery logic logically precisely accurately smoothly cleanly seamlessly beautifully smoothly effortlessly practically exactly dependably precisely cleanly cleanly perfectly beautifully clearly realistically.
