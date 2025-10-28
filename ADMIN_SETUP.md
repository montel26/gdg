# Admin Management - GDG DevFest

## How the Authentication System Works

### Current System

1. **Environment Variables (.env.local)**: 
   - Only used ONCE when creating the **first admin user**
   - After that, all admins are stored in `data/gdg.json`
   
2. **Database Storage**:
   - All admin credentials are stored in `data/gdg.json` 
   - Multiple admins are already supported!
   - The system checks all admins when logging in

### Adding Multiple Admins

You have **three options**:

#### Option 1: Add via Script (Recommended)

Run the script I created:
```bash
npx tsx add-admin.ts <username> <password>
```

Example:
```bash
npx tsx add-admin.ts john john123456
npx tsx add-admin.ts sarah sarah123456
```

#### Option 2: Add Manually to Database

Edit `data/gdg.json` and add to the `admins` array:

```json
{
  "admins": [
    {
      "id": "1760554531587",
      "username": "admin",
      "passwordHash": "$2b$10$vkfH0ADiSyJ.HpTZXMj9Wu2v8YtTT1jUE42MAPdVStCpeBAmaxBC.",
      "createdAt": "2025-10-15T18:55:31.587Z"
    },
    {
      "id": "1761658000000",
      "username": "john",
      "passwordHash": "<bcrypt-hash-here>",
      "createdAt": "2025-10-28T12:00:00.000Z"
    }
  ]
}
```

To generate the bcrypt hash:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 10).then(hash => console.log(hash))"
```

#### Option 3: Add via Admin Panel (Future)

You could add an "Add Admin" feature to the admin panel, but that would require more development.

---

## Current Setup

- **Admin username**: `admin`
- **Admin password**: `admin123` (from .env.local)

To add more admins, run:
```bash
npx tsx add-admin.ts newadmin newpassword123
```

---

## Security Notes

⚠️ **Important**:
- The `.env.local` file is only used to create the **first** admin
- All subsequent logins use the database
- You can have as many admins as you want
- Each admin needs a unique username

✅ **Already Working**:
- Multiple admin support is built-in!
- The system already checks all admins in the database
- No code changes needed to support multiple admins

---

## To Change Existing Admin Password

You'll need to:
1. Generate a new bcrypt hash for the new password
2. Update the `passwordHash` in `data/gdg.json` for that admin

Or delete and re-add the admin using the script.
