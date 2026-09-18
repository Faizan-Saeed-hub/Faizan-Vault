# Muhammad Faizan's Personal Vault - GitHub & Vercel Deployment Guide

This project is 100% self-contained and ready for immediate deployment on **GitHub** and **Vercel** with direct **Cloudinary** cloud uploads.

---

## Step 1: Set Your Cloudinary Credentials (One-time)

Open [`config.js`](./config.js) and fill in your details from your [Cloudinary Dashboard](https://cloudinary.com/console):

```javascript
const VAULTIX_CONFIG = {
  cloudName: "YOUR_CLOUD_NAME",       // e.g. "faizan-cloud"
  uploadPreset: "YOUR_UPLOAD_PRESET", // e.g. "faizan_preset"
  apiKey: "YOUR_API_KEY",             // Optional e.g. "123456789"
  folderName: "faizan_vault",         // Cloudinary folder created automatically
  autoUploadToCloud: true
};
```

> **How to create an Upload Preset in Cloudinary (takes 30 seconds):**
> 1. Log in to [Cloudinary](https://cloudinary.com/console).
> 2. Click the **Gear icon (Settings)** at the bottom left.
> 3. Click **Upload** tab.
> 4. Scroll down to **Upload presets** and click **Add upload preset**.
> 5. Set **Signing Mode** to **Unsigned**.
> 6. Click **Save**. Copy that preset name into `config.js`!

*(Alternatively, you can also enter these directly in the web app by clicking the **"☁️ Cloud Storage"** button in the top navbar!)*

---

## Step 2: Push to GitHub

In your project directory terminal:
```bash
git init
git add .
git commit -m "Muhammad Faizan Personal Vault with Cloudinary Integration"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/faizan-vault.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel (Free & Instant)

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New... ➔ Project**.
3. Select your `faizan-vault` GitHub repository.
4. Click **Deploy** (No build settings needed, it automatically uses `vercel.json`).
5. Your website will be live worldwide with an `https://...vercel.app` URL!

---

## How It Works:
- Every time you upload an ID Card (Front & Back), Photo, Video, or PDF, the file uploads **directly** to your Cloudinary storage.
- Cloudinary automatically creates the subfolders (`faizan_vault/idcards`, `faizan_vault/photos`, etc.).
- The generated secure CDN link is saved into your personal vault so your files are permanently hosted on the cloud!
