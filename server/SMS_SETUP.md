# SMS Configuration for Emergency Requests

## Option 1: Free SMS (TextBelt) - Recommended for Testing

TextBelt offers 1 free SMS per day per IP address.

### Setup:
1. Add to `.env`:
```env
ENABLE_SMS=true
TEXTBELT_API_KEY=textbelt
```

2. For more SMS, get a paid key from https://textbelt.com/purchase/

---

## Option 2: Twilio Trial (Better for Production)

Twilio offers $15 free credit on trial account.

### Setup:
1. Sign up at https://www.twilio.com/try-twilio

2. Get your credentials from Twilio Console

3. Add to `.env`:
```env
ENABLE_SMS=true
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

4. Update `emergency.controller.ts` to use Twilio instead of TextBelt

---

## Current Implementation

- **In-App Notifications**: ✅ Always enabled (no setup needed)
- **SMS Notifications**: ⚠️ Disabled by default
  - Set `ENABLE_SMS=true` in `.env` to enable
  - Uses TextBelt free tier (1 SMS/day/IP)
  - Sends to max 5 closest donors

## Phone Number Format

Phone numbers should be in international format:
- Nepal: `+9779812345678`
- India: `+919876543210`
- USA: `+11234567890`
