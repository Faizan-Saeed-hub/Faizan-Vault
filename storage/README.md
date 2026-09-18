# Storage Folder for Muhammad Faizan's Personal Vault

This folder is designed to store your personal files for easy deployment (e.g. on GitHub Pages, Vercel, Netlify, or your private server).

## Folder Structure:
- `storage/idcards/` : Place your ID Card Front and Back image files here (e.g. `id_front.jpg`, `id_back.jpg`).
- `storage/photos/` : Place your personal high-resolution photos here.
- `storage/videos/` : Place your video clips or reels here (MP4, WebM).
- `storage/documents/` : Place your PDF certificates, degrees, deeds, and agreements here.

## How to use them in code:
In `data.js`, you can simply set the path like:
```javascript
frontUrl: "storage/idcards/my_cnic_front.jpg",
backUrl: "storage/idcards/my_cnic_back.jpg",
```
Or for photos:
```javascript
fileUrl: "storage/photos/my_photo.jpg",
```
When you deploy this project, all files inside `storage/` will be accessible everywhere without relying on local PC paths!
