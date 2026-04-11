# Postman Unit Testing Guide for Raktasahayog

This guide provides step-by-step instructions for executing the 19 unit tests defined in your Testing and Analysis report using Postman.

### Prerequisites Before You Begin
1. Make sure your local Node.js backend server is running (assumed to be on `http://localhost:5000`).
2. Have your local PostgreSQL database up and running.
3. Open Postman to create the following requests.
4. **Token Management:** For any requests that require authorization, first run the Login test to obtain the JWT token, then go to the **Authorization** tab of your Postman request, explicitly choose **Bearer Token** type, and paste your token.

---

### UT01: User Registration
**Objective:** Verify that a new user can register.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/auth/register`
3. **Headers:** `Content-Type: application/json`
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "name": "Test Donor",
     "email": "testdonor@example.com",
     "password": "Password@123",
     "role": "DONOR",
     "bloodGroup": "O+"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `201 Created` with a `success` message.

---

### UT02: User Login (Valid Credentials)
**Objective:** Verify login works and returns a JWT token.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/auth/login`
3. **Headers:** `Content-Type: application/json`
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "email": "testdonor@example.com",
     "password": "Password@123"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `200 OK`. The response body should contain the `token`. **(Copy this token for subsequent tests)**.

---

### UT03: User Login (Invalid Credentials)
**Objective:** Verify login fails with incorrect password.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/auth/login`
3. **Headers:** `Content-Type: application/json`
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "email": "testdonor@example.com",
     "password": "WrongPassword!"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `401 Unauthorized` with error message `"Invalid credentials"`.

---

### UT04: JWT Token Authentication (Valid Token)
**Objective:** Verify that checking the current logged-in user profile works with a valid token.
1. **Method:** `GET`
2. **URL:** `http://localhost:5000/api/auth/me`
3. **Authorization:** Select **Bearer Token** and paste the token from UT02.
4. Click **Send**.
5. **Expected Output:** Status `200 OK` showing the authenticated user's profile JSON.

---

### UT05: JWT Token Authentication (Missing Token)
**Objective:** Verify that missing token rejects access.
1. **Method:** `GET`
2. **URL:** `http://localhost:5000/api/auth/me`
3. **Authorization:** Select **No Auth**.
4. Click **Send**.
5. **Expected Output:** Status `401 Unauthorized` with message `"Access token required"`.

---

### UT06: Role-Based Access Control
**Objective:** Verify a Donor cannot access an Admin-only route.
1. **Method:** `GET`
2. **URL:** `http://localhost:5000/api/admin/users` (assuming this is an admin route)
3. **Authorization:** Select **Bearer Token** and paste a Donor's JWT token.
4. Click **Send**.
5. **Expected Output:** Status `403 Forbidden`.

---

### UT07: Appointment Booking by Donor
**Objective:** Verify logging a blood donation appointment.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/appointments`
3. **Authorization:** Valid **Bearer Token** (Donor).
4. **Headers:** `Content-Type: application/json`
5. **Body:** Select **raw** > **JSON**
   ```json
   {
     "organizationId": "org-uuid-here",
     "appointmentDate": "2026-05-10T10:00:00Z",
     "bloodGroup": "O+"
   }
   ```
6. Click **Send**.
7. **Expected Output:** Status `201 Created` with the appointment document showing status `pending`.

---

### UT08: Appointment Status Update (Organization Confirm)
**Objective:** Verify an Organization can confirm a pending appointment.
1. **Method:** `PUT` or `PATCH`
2. **URL:** `http://localhost:5000/api/appointments/<appointment_id_from_UT07>/status`
3. **Authorization:** Valid **Bearer Token** (Organization Role).
4. **Headers:** `Content-Type: application/json`
5. **Body:** Select **raw** > **JSON**
   ```json
   {
     "status": "confirmed"
   }
   ```
6. Click **Send**.
7. **Expected Output:** Status `200 OK` with the record showing `"status": "confirmed"`.

---

### UT09: Campaign Creation by Organization
**Objective:** Verify an Organization can create a new blood donation campaign.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/campaigns`
3. **Authorization:** Valid **Bearer Token** (Organization Role).
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "title": "Summer Blood Drive",
     "description": "Annual summer donation camp",
     "date": "2026-06-15",
     "location": "Central City Park"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `201 Created` with campaign data.

---

### UT10: Campaign View by Donor
**Objective:** Verify a user can view existing campaigns.
1. **Method:** `GET`
2. **URL:** `http://localhost:5000/api/campaigns`
3. **Authorization:** Valid **Bearer Token** (Donor).
4. Click **Send**.
5. **Expected Output:** Status `200 OK` with a JSON array of campaigns.

---

### UT11: Document File Upload
**Objective:** Verify users can upload documents (e.g. ID, medical proof).
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/documents/upload`
3. **Authorization:** Valid **Bearer Token**.
4. **Body:** Select **form-data**
   * Change key type from `Text` to `File`.
   * Key: `file` (or `document`)
   * Value: Select a target PDF or image file from your computer.
5. Click **Send**.
6. **Expected Output:** Status `201 Created` showing the mapped upload object URL.

---

### UT12: Real-Time Notification and Status
**Objective:** Verify push notifications/events payload generation.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/notifications/send` (use correct endpoint path)
3. **Authorization:** Valid **Bearer Token**.
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "userId": "target-uuid",
     "title": "Appointment Update",
     "message": "Your appointment was confirmed."
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `200 OK` or `201 Created` showing the dispatched alert data.

---

### UT13: Stripe Payment Intent Creation
**Objective:** Verify system returns Stripe client secret for transactions.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/payments/create-intent`
3. **Authorization:** Valid **Bearer Token**.
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "amount": 500,
     "currency": "usd"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `200 OK` containing `"clientSecret"`.

---

### UT14: eSewa Payment Initialisation
**Objective:** Verify correct payload formatting & signed hashes for eSewa.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/payments/esewa`
3. **Authorization:** Valid **Bearer Token**.
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "amount": 1000,
     "item": "Donation Support"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `200 OK` displaying the signed form data (Product Code, Hash/Signature).

---

### UT15: Admin User Management
**Objective:** Verify Admin can deactivate a user.
1. **Method:** `PUT` (or `PATCH`)
2. **URL:** `http://localhost:5000/api/admin/users/<user_uuid_here>/deactivate`
3. **Authorization:** Valid **Bearer Token** (Admin Role).
4. Click **Send**.
5. **Expected Output:** Status `200 OK` indicating `isActive` is set to `false`.

---

### UT16: Emergency Blood Requests
**Objective:** Verify emergency request with mapping coordinates works.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/emergency`
3. **Authorization:** Valid **Bearer Token**.
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "bloodGroup": "O-",
     "hospitalName": "City Hospital",
     "latitude": "27.7172",
     "longitude": "85.3240",
     "radiusKm": 10
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `201 Created` identifying the triggered proximity calculation radius.

---

### UT17: Blood Stock and Inventory Management
**Objective:** Verify Organization can update their blood unit aggregates.
1. **Method:** `PUT` or `POST`
2. **URL:** `http://localhost:5000/api/inventory/update` (adjust URL if needed)
3. **Authorization:** Valid **Bearer Token** (Organization).
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "bloodGroup": "A+",
     "quantity": 1,
     "action": "increment"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `200 OK` with updated stock counts.

---

### UT18: Donor Profiles and Badge System
**Objective:** Verify updating donor eligibility checks (height, weight, dates).
1. **Method:** `PUT` or `POST`
2. **URL:** `http://localhost:5000/api/profiles/upsert` (or similar endpoint)
3. **Authorization:** Valid **Bearer Token** (Donor).
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "age": 25,
     "weight": 60,
     "lastDonationDate": null
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `201 Created` or `200 OK` bypassing medical checks successfully.

---

### UT19: Organization Registration
**Objective:** Verify Organization specific payloads sign up correctly.
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/auth/register`
3. **Headers:** `Content-Type: application/json`
4. **Body:** Select **raw** > **JSON**
   ```json
   {
     "name": "Red Cross Clinic",
     "email": "clinic@redcross.org",
     "password": "Password123!",
     "role": "ORGANIZATION",
     "type": "HOSPITAL"
   }
   ```
5. Click **Send**.
6. **Expected Output:** Status `201 Created` showing mapped relational constraints for an organization structure.
