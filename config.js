/**
 * =========================================================================
 * FAIZAN VAULT - CLOUD & STORAGE CONFIGURATION
 * =========================================================================
 * 1. Cloudinary: Stores all media files (ID Cards Front/Back, Photos, PDFs)
 * 2. Supabase Cloud: Synchronizes vault data in real-time across all devices (Laptop <-> Mobile)
 * =========================================================================
 */

const VAULTIX_CONFIG = {
  // Cloudinary CDN Asset Storage
  cloudName: "ix9sq9a9",
  uploadPreset: "g6p72bwo",
  apiKey: "",
  folderName: "faizan_vault",
  autoUploadToCloud: true,

  // Private Vault Access Credentials
  auth: {
    email: "Faizan0687@gmail.com",
    password: "Faizan@786"
  },

  // Supabase Real-Time Cross-Device Sync Engine
  supabase: {
    url: "https://srrpewuenwnusmxmazho.supabase.co",
    anonKey: "sb_publishable_nwlnnKZxEUEWPjNRzaX3PQ_a7_fd7-x"
  }
};

// Expose to window for global access across the app
window.VAULTIX_CONFIG = VAULTIX_CONFIG;
