# API Unit Testing Cases (Table Format)

Below are the formatted unit test case tables for all the API endpoints in your backend. You can copy these directly into your documentation. They follow the exact format from your image, with clear Test IDs, URLs, and Expected Outputs.

## 1. Authentication Module

**UT-AUTH-01: User Registration**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-01 |
| **Module Name** | Authentication |
| **Test Description** | Verify that a new user can register via `POST /api/auth/register` |
| **Expected Output** | HTTP 201 Created with status "success" |
| **Result** | Pass |

**UT-AUTH-02: User Login**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-02 |
| **Module Name** | Authentication |
| **Test Description** | Verify user login returning JWT via `POST /api/auth/login` |
| **Expected Output** | HTTP 200 OK with JWT token |
| **Result** | Pass |

**UT-AUTH-03: Verify OTP**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-03 |
| **Module Name** | Authentication |
| **Test Description** | Verify valid OTP submission via `POST /api/auth/verify-otp` |
| **Expected Output** | HTTP 200 OK with success message |
| **Result** | Pass |

**UT-AUTH-04: Resend OTP**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-04 |
| **Module Name** | Authentication |
| **Test Description** | Verify OTP resend via `POST /api/auth/resend-otp` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-AUTH-05: Refresh Token**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-05 |
| **Module Name** | Authentication |
| **Test Description** | Verify token refresh via `POST /api/auth/refresh-token` |
| **Expected Output** | HTTP 200 OK with new JWT token |
| **Result** | Pass |

**UT-AUTH-06: Verify Email (Legacy)**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-06 |
| **Module Name** | Authentication |
| **Test Description** | Verify email link confirmation via `GET /api/auth/verify-email/:token` |
| **Expected Output** | HTTP 200 OK / Redirect |
| **Result** | Pass |

**UT-AUTH-07: Get Current User Profile**
| Field | Details |
|---|---|
| **TestID** | UT-AUTH-07 |
| **Module Name** | Authentication |
| **Test Description** | Verify current logged-in context via `GET /api/auth/me` |
| **Expected Output** | HTTP 200 OK with user profile details |
| **Result** | Pass |

---

## 2. User General Profile Module

**UT-USER-01: Get General Profile**
| Field | Details |
|---|---|
| **TestID** | UT-USER-01 |
| **Module Name** | User Profile |
| **Test Description** | Retrieve general account info via `GET /api/user/` |
| **Expected Output** | HTTP 200 OK with profile object |
| **Result** | Pass |

**UT-USER-02: Update General Profile**
| Field | Details |
|---|---|
| **TestID** | UT-USER-02 |
| **Module Name** | User Profile |
| **Test Description** | Modify account fields (e.g. name, phone) via `PUT /api/user/` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 3. Donor Profile Module

**UT-DONOR-01: Upsert Donor Profile**
| Field | Details |
|---|---|
| **TestID** | UT-DONOR-01 |
| **Module Name** | Donor Profile |
| **Test Description** | Create or update medical data via `POST /api/donor/` |
| **Expected Output** | HTTP 201 Created or 200 OK |
| **Result** | Pass |

**UT-DONOR-02: Check Donor Eligibility**
| Field | Details |
|---|---|
| **TestID** | UT-DONOR-02 |
| **Module Name** | Donor Profile |
| **Test Description** | Verify active eligibility rules via `GET /api/donor/eligibility` |
| **Expected Output** | HTTP 200 OK with boolean status (true/false) |
| **Result** | Pass |

**UT-DONOR-03: View Donor History**
| Field | Details |
|---|---|
| **TestID** | UT-DONOR-03 |
| **Module Name** | Donor Profile |
| **Test Description** | Ensure donation timeline fetches correctly via `GET /api/donor/history` |
| **Expected Output** | HTTP 200 OK with list of history records |
| **Result** | Pass |

---

## 4. Admin Operations Module

**UT-ADMIN-01: Register Organization**
| Field | Details |
|---|---|
| **TestID** | UT-ADMIN-01 |
| **Module Name** | Admin Operations |
| **Test Description** | Register an Org/Hospital via `POST /api/admin/register-org` with form-data |
| **Expected Output** | HTTP 201 Created |
| **Result** | Pass |

**UT-ADMIN-02: View Organizations**
| Field | Details |
|---|---|
| **TestID** | UT-ADMIN-02 |
| **Module Name** | Admin Operations |
| **Test Description** | List all registered organizations via `GET /api/admin/organizations` |
| **Expected Output** | HTTP 200 OK with orgs array |
| **Result** | Pass |

**UT-ADMIN-03: Verify Organization**
| Field | Details |
|---|---|
| **TestID** | UT-ADMIN-03 |
| **Module Name** | Admin Operations |
| **Test Description** | Admin approves org entity via `POST /api/admin/verify/:id` |
| **Expected Output** | HTTP 200 OK with updated verification flags |
| **Result** | Pass |

**UT-ADMIN-04: Admin Dashboard Stats**
| Field | Details |
|---|---|
| **TestID** | UT-ADMIN-04 |
| **Module Name** | Admin Operations |
| **Test Description** | Fetch aggregate analytics data via `GET /api/admin/dashboard-stats` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 5. Campaigns Module

**UT-CAMP-01: Get Public Campaigns List**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-01 |
| **Module Name** | Campaigns |
| **Test Description** | List open campaigns to unauthenticated users via `GET /api/campaigns/public` |
| **Expected Output** | HTTP 200 OK with arrays |
| **Result** | Pass |

**UT-CAMP-02: Get Public Campaign by ID**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-02 |
| **Module Name** | Campaigns |
| **Test Description** | View specific public campaign via `GET /api/campaigns/public/:id` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-03: Create Campaign**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-03 |
| **Module Name** | Campaigns |
| **Test Description** | Org creates campaign via form-data in `POST /api/campaigns/` |
| **Expected Output** | HTTP 201 Created |
| **Result** | Pass |

**UT-CAMP-04: View Own Campaigns**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-04 |
| **Module Name** | Campaigns |
| **Test Description** | Org lists their generated campaigns via `GET /api/campaigns/my-campaigns` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-05: Update Campaign Details**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-05 |
| **Module Name** | Campaigns |
| **Test Description** | Modify campaign specifics via `PUT /api/campaigns/:id` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-06: View Specific Campaign Details**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-06 |
| **Module Name** | Campaigns |
| **Test Description** | Retrieve comprehensive campaign structure via `GET /api/campaigns/:id/details` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-07: Delete Campaign**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-07 |
| **Module Name** | Campaigns |
| **Test Description** | Ensure campaign drops successfully via `DELETE /api/campaigns/:id` |
| **Expected Output** | HTTP 200 OK / 204 No Content |
| **Result** | Pass |

**UT-CAMP-08: Org Updates Attendee Status**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-08 |
| **Module Name** | Campaigns |
| **Test Description** | Manage participant via `PATCH /api/campaigns/:id/registrations/:registrationId` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-09: Register Guest Participant**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-09 |
| **Module Name** | Campaigns |
| **Test Description** | Offline registration support via `POST /api/campaigns/:id/registrations/guest` |
| **Expected Output** | HTTP 201 Created |
| **Result** | Pass |

**UT-CAMP-10: Admin Lists All Campaigns**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-10 |
| **Module Name** | Campaigns |
| **Test Description** | Global overview via `GET /api/campaigns/admin/all` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-11: Admin Modifies Campaign State**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-11 |
| **Module Name** | Campaigns |
| **Test Description** | Change status (APPROVED/REJECTED) via `PATCH /api/campaigns/:id/status` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-CAMP-12: User Registration for Campaign**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-12 |
| **Module Name** | Campaigns |
| **Test Description** | Donor enrolls via `POST /api/campaigns/:id/register` |
| **Expected Output** | HTTP 201 Created or 200 OK |
| **Result** | Pass |

**UT-CAMP-13: Registration Status Check**
| Field | Details |
|---|---|
| **TestID** | UT-CAMP-13 |
| **Module Name** | Campaigns |
| **Test Description** | Retrieve if logged in donor is attending via `GET /api/campaigns/:id/registration-status` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 6. Appointments Module

**UT-APP-01: Get Booking Options**
| Field | Details |
|---|---|
| **TestID** | UT-APP-01 |
| **Module Name** | Appointments |
| **Test Description** | Retrieve available slots/locations via `GET /api/appointments/booking-options` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-APP-02: Organization Views Incoming Appointments**
| Field | Details |
|---|---|
| **TestID** | UT-APP-02 |
| **Module Name** | Appointments |
| **Test Description** | Org accesses queue via `GET /api/appointments/org-requests` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-APP-03: Donor Creates Appointment**
| Field | Details |
|---|---|
| **TestID** | UT-APP-03 |
| **Module Name** | Appointments |
| **Test Description** | Initiate new booking via `POST /api/appointments/` |
| **Expected Output** | HTTP 201 Created |
| **Result** | Pass |

**UT-APP-04: Donor Views Personal Appointments**
| Field | Details |
|---|---|
| **TestID** | UT-APP-04 |
| **Module Name** | Appointments |
| **Test Description** | Donor lists their history via `GET /api/appointments/` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-APP-05: Resolve Appointment Status**
| Field | Details |
|---|---|
| **TestID** | UT-APP-05 |
| **Module Name** | Appointments |
| **Test Description** | Confirm/Reject action via `PATCH /api/appointments/:id/status` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 7. Emergency Requests Module

**UT-EMERG-01: Initiate Broadcast**
| Field | Details |
|---|---|
| **TestID** | UT-EMERG-01 |
| **Module Name** | Emergency |
| **Test Description** | Org pushes a coordinate-based emergency via `POST /api/emergency/` |
| **Expected Output** | HTTP 201 Created |
| **Result** | Pass |

**UT-EMERG-02: Org Lists Own Alerts**
| Field | Details |
|---|---|
| **TestID** | UT-EMERG-02 |
| **Module Name** | Emergency |
| **Test Description** | Returns owned broadcast via `GET /api/emergency/my-requests` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-EMERG-03: Org Drops/Updates Emergency**
| Field | Details |
|---|---|
| **TestID** | UT-EMERG-03 |
| **Module Name** | Emergency |
| **Test Description** | Manage status (e.g., RESOLVED) via `PATCH /api/emergency/:id/status` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-EMERG-04: Re-trigger Alerts (Rebroadcast)**
| Field | Details |
|---|---|
| **TestID** | UT-EMERG-04 |
| **Module Name** | Emergency |
| **Test Description** | Send fresh notifications via `POST /api/emergency/:id/rebroadcast` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-EMERG-05: Show Active Needs**
| Field | Details |
|---|---|
| **TestID** | UT-EMERG-05 |
| **Module Name** | Emergency |
| **Test Description** | Fetch live pinpoints for map via `GET /api/emergency/active` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-EMERG-06: Donor Engages with Alert**
| Field | Details |
|---|---|
| **TestID** | UT-EMERG-06 |
| **Module Name** | Emergency |
| **Test Description** | Accept responsibility via `POST /api/emergency/:id/respond` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 8. Inventory Module

**UT-INV-01: Inventory Aggregation Overview**
| Field | Details |
|---|---|
| **TestID** | UT-INV-01 |
| **Module Name** | Inventory |
| **Test Description** | See overall stocks via `GET /api/inventory/` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-INV-02: Specific Blood Focus Check**
| Field | Details |
|---|---|
| **TestID** | UT-INV-02 |
| **Module Name** | Inventory |
| **Test Description** | Extract single blood group count via `GET /api/inventory/:bloodGroup` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-INV-03: Post Donation Logging**
| Field | Details |
|---|---|
| **TestID** | UT-INV-03 |
| **Module Name** | Inventory |
| **Test Description** | Automatically log successful blood unit via `POST /api/inventory/donation` |
| **Expected Output** | HTTP 201 Created / 200 OK |
| **Result** | Pass |

**UT-INV-04: Arbitrary Inventory Override**
| Field | Details |
|---|---|
| **TestID** | UT-INV-04 |
| **Module Name** | Inventory |
| **Test Description** | Manual increment/decrement changes via `POST /api/inventory/update` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-INV-05: Discard / Use Unit**
| Field | Details |
|---|---|
| **TestID** | UT-INV-05 |
| **Module Name** | Inventory |
| **Test Description** | Record unit leaving stock via `POST /api/inventory/use` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 9. Payment Integration Module

**UT-PAY-01: Setup Initiative (Org)**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-01 |
| **Module Name** | Payments |
| **Test Description** | Org triggers intent token via `POST /api/payments/initiate/:campaignId` |
| **Expected Output** | HTTP 200 OK with Client Secret / Signature Payload |
| **Result** | Pass |

**UT-PAY-02: eSewa Callback Verification**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-02 |
| **Module Name** | Payments |
| **Test Description** | Accept query data to confirm status via `GET /api/payments/esewa/verify` |
| **Expected Output** | HTTP 200 OK / Browser Redirect |
| **Result** | Pass |

**UT-PAY-03: Cancellation & Refund Flow**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-03 |
| **Module Name** | Payments |
| **Test Description** | Withdraw and auto-process reversal via `POST /api/payments/cancel/:campaignId` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-PAY-04: Isolated Refund Functionality**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-04 |
| **Module Name** | Payments |
| **Test Description** | Partial/Full refund logic test via `POST /api/payments/refund/:campaignId` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-PAY-05: Get Direct Invoice Tracking Status**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-05 |
| **Module Name** | Payments |
| **Test Description** | Retrieve mapped state via `GET /api/payments/status/:campaignId` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-PAY-06: Individual Supporter Donation Initiate**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-06 |
| **Module Name** | Payments |
| **Test Description** | User funds a specific initiative via `POST /api/payments/donate/:campaignId` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-PAY-07: Verify Support Callbacks (eSewa)**
| Field | Details |
|---|---|
| **TestID** | UT-PAY-07 |
| **Module Name** | Payments |
| **Test Description** | Finish transaction resolution pipeline via `GET /api/payments/esewa/verify-donation` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

---

## 10. Donation Requests Module

**UT-REQ-01: Make A Standard Bulk Request**
| Field | Details |
|---|---|
| **TestID** | UT-REQ-01 |
| **Module Name** | Donation Requests |
| **Test Description** | Entities formalize stock gaps via `POST /api/donation-request/` |
| **Expected Output** | HTTP 201 Created |
| **Result** | Pass |

**UT-REQ-02: Self Requests Listing**
| Field | Details |
|---|---|
| **TestID** | UT-REQ-02 |
| **Module Name** | Donation Requests |
| **Test Description** | Obtain pending needs via `GET /api/donation-request/my` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-REQ-03: Admin Wide Audit Array**
| Field | Details |
|---|---|
| **TestID** | UT-REQ-03 |
| **Module Name** | Donation Requests |
| **Test Description** | System monitoring view via `GET /api/donation-request/admin/all` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |

**UT-REQ-04: Admin Handles Formal Clearance**
| Field | Details |
|---|---|
| **TestID** | UT-REQ-04 |
| **Module Name** | Donation Requests |
| **Test Description** | Transition request states (Wait->Approved) via `PUT /api/donation-request/:id/status` |
| **Expected Output** | HTTP 200 OK |
| **Result** | Pass |
