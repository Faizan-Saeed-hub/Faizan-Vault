# 🛡️ Faizan Vault (Vaultix)

A luxury, private personal document vault and interactive media gallery web application built with pure **HTML5, CSS3, and JavaScript**.

---

## ✨ Features

- **🔐 Private Authentication Lock Screen**:
  - Secure gateway with credentials authentication
  - Zero browser autofill for clean, secure entry
  - Session persistence and 1-click instant vault lock
- **🪪 Dual-Sided ID Cards with 3D Flip Viewer**:
  - Interactive 3D flip card showcase on the top banner
  - Dual-side upload (Front & Back)
  - **Clean 1-Page Combined Download** (PNG & PDF) with pure card presentation (no headers, footers, or text labels)
- **📑 In-App PDF Reader Studio**:
  - Native document reader with scrollable pages, zoom in/out, and text selection
  - Zero-credential client-side Blob downloads
  - High-definition document page view
- **📸 Photos & 🎬 Videos**:
  - High-resolution zoomable photo lightbox (➕ / ➖ / 100% reset)
  - Embedded HTML5 video player with seekbar and volume controls
- **☁️ Cloudinary Cloud Storage Integration**:
  - Direct client-side unsigned uploads to Cloudinary CDN
  - Automated folder organization (`faizan_vault/idcards`, `faizan_vault/photos`, `faizan_vault/videos`, `faizan_vault/documents`)
  - Real-time animated progress bar during uploads
- **💾 Persistent Browser Storage (IndexedDB)**:
  - High-capacity local storage for instant offline access without 5MB LocalStorage limits
  - Full backup export and restore via JSON
- **🔍 Instant Live Search & Filtering**:
  - Filter by Category (All, ID Cards, Photos, Videos, Documents)
  - Real-time search across titles, descriptions, card numbers, and tags
  - Sorting by Newest, Oldest, and Alphabetical

---

## 📁 Project Structure

```
├── index.html        # Main application structure & semantic markup
├── style.css         # Luxury dark glassmorphism design system & 3D transforms
├── app.js            # Core application logic, IndexedDB engine & Cloudinary integration
├── config.js         # Cloudinary configuration & authentication settings
├── data.js           # Default preloaded items & code-level customization
├── vercel.json       # Vercel deployment configuration
└── DEPLOYMENT.md     # Step-by-step deployment guide for GitHub & Vercel
```

---

## 🚀 Getting Started

### Local Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/Faizan-Saeed-hub/Faizan-Vault.git
   ```
2. Open `index.html` directly in any web browser, or serve it using any local static server:
   ```bash
   npx serve .
   # or
   python -m http.server 3000
   ```

### 🌐 Deploying to Vercel
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `Faizan-Vault` repository and click **Deploy**.

---

## 👤 Author
**Muhammad Faizan**
