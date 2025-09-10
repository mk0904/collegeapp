# UploadThing Setup Instructions

## Quick Setup (2 minutes)

### 1. Create UploadThing Account
1. Go to [uploadthing.com](https://uploadthing.com)
2. Click "Sign Up" and create a free account
3. Verify your email

### 2. Get Your API Keys
1. After logging in, go to your dashboard
2. Click on "API Keys" or "Settings"
3. Copy your:
   - **Secret Key** (starts with `sk_`)
   - **App ID** (starts with `ut_`)

### 3. Add Environment Variables
Add these to your `.env.local` file:

```bash
# UploadThing Configuration
UPLOADTHING_SECRET=sk_your_secret_key_here
UPLOADTHING_APP_ID=ut_your_app_id_here
```

### 4. Test the Upload
1. Start your development server: `npm run dev`
2. Try uploading files in the circular modal
3. Check the browser console for upload logs

## What You Get
- ✅ **2GB free storage**
- ✅ **2GB bandwidth/month**
- ✅ **Multiple file uploads**
- ✅ **All file types supported**
- ✅ **Reliable URLs**
- ✅ **No account restrictions**

## Troubleshooting
If you get errors:
1. Make sure environment variables are correct
2. Restart your development server after adding env vars
3. Check the browser console for specific error messages

## File Limits
- **Images**: Up to 4MB each, 10 files max
- **PDFs**: Up to 16MB each, 10 files max
- **Videos**: Up to 32MB each, 5 files max
- **Other files**: Up to 16MB each, 10 files max

That's it! UploadThing should work perfectly for your file attachments.

