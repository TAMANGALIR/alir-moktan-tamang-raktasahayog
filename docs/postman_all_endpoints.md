# Comprehensive Postman API Testing Guide
This document breaks down every API endpoint available in the Raktasahayog backend and provides the exact Postman test cases needed to document and run them.

> **Pre-requisites:**
> 1. Ensure your local server is running on port 3000.
> 2. Endpoints that require authentication must have the generated JWT token passed in the **Authorization** > **Bearer Token** tab in Postman.

---

## 1. Authentication Routes (`api/auth`)

### 1.1 User Registration
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Body (raw > JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "Password123!",
    "role": "DONOR",
    "bloodGroup": "A+"
  }
  ```

### 1.2 User Login
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw > JSON):**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "Password123!"
  }
  ```
> **Action:** Copy the `token` from the response to use in other tests.

### 1.3 OTP Verification
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/verify-otp`
* **Headers:** `Content-Type: application/json`
* **Body (raw > JSON):**
  ```json
  {
     "email": "johndoe@example.com",
     "otp": "123456"
  }
  ```

### 1.4 Resend OTP
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/resend-otp`
* **Headers:** `Content-Type: application/json`
* **Body (raw > JSON):**
  ```json
  { "email": "johndoe@example.com" }
  ```

### 1.5 Refresh Token
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/auth/refresh-token`
* **Headers:** `Content-Type: application/json`
* **Body (raw > JSON):**
  ```json
  { "refreshToken": "your-refresh-token-here" }
  ```

### 1.6 Verify Email (Legacy)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/auth/verify-email/:token`
* **Body:** *None*

### 1.7 Get Current User Profile
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/auth/me`
* **Authorization:** Bearer Token
* **Body:** *None*

---

## 2. User Profile Routes (`api/user`)

### 2.1 Get Current User General Profile
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/user/`
* **Authorization:** Bearer Token
* **Body:** *None*

### 2.2 Update User General Profile
* **Method:** `PUT`
* **URL:** `http://localhost:3000/api/user/`
* **Authorization:** Bearer Token
* **Body (raw > JSON):**
  ```json
  {
    "name": "Jane Doe Refreshed",
    "phone": "9800000000"
  }
  ```

---

## 3. Donor Profile Routes (`api/donor`)

### 3.1 Upsert Donor Profile
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/donor/`
* **Authorization:** Bearer Token
* **Body (raw > JSON):**
  ```json
  {
     "age": 25,
     "weight": 60,
     "lastDonationDate": "2026-03-01T00:00:00Z"
  }
  ```

### 3.2 View Donor Eligibility Check
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/donor/eligibility`
* **Authorization:** Bearer Token
* **Body:** *None*

### 3.3 Get Donor Donation History
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/donor/history`
* **Authorization:** Bearer Token
* **Body:** *None*

---

## 4. Admin Routes (`api/admin`)

### 4.1 Register Organization (Public)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/admin/organizations`
* **Body (form-data):**
  * `name`: Red Cross
  * `email`: org@example.com
  * `type`: HOSPITAL
  * `license`: *(File Upload in Postman)*

### 4.2 Get All Organizations (Admin only)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/organizations`
* **Authorization:** Bearer Token (ADMIN)
* **Body:** *None*

### 4.3 Verify Organization (Admin only)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/admin/verify/:id`
* **Authorization:** Bearer Token (ADMIN)
* **Body:** *None*

### 4.4 Get Dashboard Stats (Admin only)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/dashboard-stats`
* **Authorization:** Bearer Token (ADMIN)
* **Body:** *None*

---

## 5. Campaigns Routes (`api/campaigns`)

### 5.1 Get Public Campaigns
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/campaigns/public`
* **Body:** *None*

### 5.2 Get Public Campaign by ID
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/campaigns/public/:id`
* **Body:** *None*

### 5.3 Create Campaign (Organization only)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/campaigns/`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (form-data):**
  * `title`: Summer Drive
  * `date`: 2026-06-15
  * `banner` / `permit`: *(File uploads in Postman)*

### 5.4 Get My Campaigns (Organization)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/campaigns/my-campaigns`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 5.5 Update Campaign (Organization)
* **Method:** `PUT`
* **URL:** `http://localhost:3000/api/campaigns/:id`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (form-data):** *(Modify campaign fields as form keys)*

### 5.6 Get Campaign Details (Organization)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/campaigns/:id/details`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 5.7 Delete Campaign (Organization)
* **Method:** `DELETE`
* **URL:** `http://localhost:3000/api/campaigns/:id`
* **Authorization:** Bearer Token (ORGANIZATION)

### 5.8 Update Registration Status (Organization)
* **Method:** `PATCH`
* **URL:** `http://localhost:3000/api/campaigns/:id/registrations/:registrationId`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  { "status": "approved" }
  ```

### 5.9 Register Guest Participant (Organization)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/campaigns/:id/registrations/guest`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (raw > JSON):** 
  ```json
  {
    "name": "Guest Donor",
    "bloodGroup": "B+"
  }
  ```

### 5.10 Get All Campaigns for Admin
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/campaigns/admin/all`
* **Authorization:** Bearer Token (ADMIN)
* **Body:** *None*

### 5.11 Update Campaign Status (Admin)
* **Method:** `PATCH`
* **URL:** `http://localhost:3000/api/campaigns/:id/status`
* **Authorization:** Bearer Token (ADMIN)
* **Body (raw > JSON):**
  ```json
  { "status": "APPROVED" }
  ```

### 5.12 User Register for Campaign
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/campaigns/:id/register`
* **Authorization:** Bearer Token
* **Body:** *None*

### 5.13 Check Registration Status for User
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/campaigns/:id/registration-status`
* **Authorization:** Bearer Token
* **Body:** *None*

---

## 6. Appointments Routes (`api/appointments`)

### 6.1 Get Available Booking Options
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/appointments/booking-options`
* **Authorization:** Bearer Token 
* **Body:** *None*

### 6.2 Get Appointments sent to Organization
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/appointments/org-requests`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 6.3 Create Appointment (User)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/appointments/`
* **Authorization:** Bearer Token 
* **Body (raw > JSON):**
  ```json
  {
    "organizationId": "target-org-uuid-here",
    "appointmentDate": "2026-05-15T10:00:00Z",
    "bloodGroup": "O-"
  }
  ```

### 6.4 Get User's Appointments
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/appointments/`
* **Authorization:** Bearer Token
* **Body:** *None*

### 6.5 Update Appointment Status
* **Method:** `PATCH`
* **URL:** `http://localhost:3000/api/appointments/:id/status`
* **Authorization:** Bearer Token
* **Body (raw > JSON):**
  ```json
  {
    "status": "confirmed"
  }
  ```

---

## 7. Emergency Routes (`api/emergency`)

### 7.1 Create Emergency Request (Organization)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/emergency/`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  {
    "bloodGroup": "AB+",
    "hospitalName": "City General Hospital",
    "latitude": "27.7172",
    "longitude": "85.3240",
    "radiusKm": 10
  }
  ```

### 7.2 Get Custom Organization Emergency Requests
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/emergency/my-requests`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 7.3 Update Emergency Status (Organization)
* **Method:** `PATCH`
* **URL:** `http://localhost:3000/api/emergency/:id/status`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  { "status": "RESOLVED" }
  ```

### 7.4 Rebroadcast Emergency Request (Organization)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/emergency/:id/rebroadcast`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 7.5 Get Active Emergencies (Users/Public view)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/emergency/active`
* **Authorization:** Bearer Token
* **Body:** *None*

### 7.6 User Respond to Emergency
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/emergency/:id/respond`
* **Authorization:** Bearer Token
* **Body:** *None*

---

## 8. Inventory Routes (`api/inventory`)

### 8.1 Get Region Inventory
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/inventory/`
* **Authorization:** Bearer Token (ADMIN / ORGANIZATION)
* **Body:** *None*

### 8.2 Get specific Blood Group Inventory
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/inventory/:bloodGroup`
* **Authorization:** Bearer Token (ADMIN / ORGANIZATION)
* **Body:** *None*

### 8.3 Record New Individual Donation
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/inventory/donation`
* **Authorization:** Bearer Token (ADMIN / ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  {
    "donorId": "target-uuid",
    "bloodGroup": "O+",
    "units": 1
  }
  ```

### 8.4 Manual Stock Update
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/inventory/update`
* **Authorization:** Bearer Token (ADMIN / ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  {
    "bloodGroup": "A+",
    "quantity": 1,
    "action": "increment"
  }
  ```

### 8.5 Mark Unit as Used
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/inventory/use`
* **Authorization:** Bearer Token (ADMIN / ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  { "unitId": "unit-uuid" }
  ```

---

## 9. Payments Routes (`api/payments`)

### 9.1 Initiate Campaign Setup Payment (Organization)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/payments/initiate/:campaignId`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body (raw > JSON):**
  ```json
  {
    "amount": 1000,
    "method": "esewa"
  }
  ```

### 9.2 Verify eSewa payment callback
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/payments/esewa/verify`
* **Body:** *None (Uses callback query parameters)*

### 9.3 Cancel Campaign / Refund Setup Payment (Organization)
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/payments/cancel/:campaignId`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 9.4 General Refund Process
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/payments/refund/:campaignId`
* **Authorization:** Bearer Token (ORGANIZATION)
* **Body:** *None*

### 9.5 Get Campaign Payment Status
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/payments/status/:campaignId`
* **Authorization:** Bearer Token
* **Body:** *None*

### 9.6 Initiate User Donation to Campaign
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/payments/donate/:campaignId`
* **Authorization:** Bearer Token
* **Body (raw > JSON):**
  ```json
  {
    "amount": 500,
    "donorName": "Test User",
    "message": "Happy to help!"
  }
  ```

### 9.7 Verify User Donation eSewa Callback 
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/payments/esewa/verify-donation`
* **Body:** *None (Uses callback query parameters)*

---

## 10. Donation Requests Routes (`api/donation-request`)

### 10.1 Create Standard Request
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/donation-request/`
* **Authorization:** Bearer Token
* **Body (raw > JSON):**
  ```json
  {
    "bloodGroup": "B+",
    "units": 2
  }
  ```

### 10.2 Get My Requests
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/donation-request/my`
* **Authorization:** Bearer Token
* **Body:** *None*

### 10.3 Get All Requests for Admin
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/donation-request/admin/all`
* **Authorization:** Bearer Token (ADMIN)
* **Body:** *None*

### 10.4 Admin Update Request Status
* **Method:** `PUT`
* **URL:** `http://localhost:3000/api/donation-request/:id/status`
* **Authorization:** Bearer Token (ADMIN)
* **Body (raw > JSON):**
  ```json
  { "status": "APPROVED" }
  ```
