/**
 * =========================================================================
 * FAIZAN VAULT - CLOUDINARY CONFIGURATION (FOR GITHUB & VERCEL DEPLOYMENT)
 * =========================================================================
 * Enter your Cloudinary credentials below.
 * Once entered, every file/image uploaded on the website will DIRECTLY upload
 * to your Cloudinary account and automatically create folders.
 * 
 * Instructions:
 * 1. cloudName: Your Cloud Name from Cloudinary Dashboard
 * 2. uploadPreset: Your unsigned upload preset name
 *    (In Cloudinary Dashboard: Settings (Gear) -> Upload -> Add upload preset -> Signing Mode: Unsigned)
 * 3. apiKey: Your API Key from Cloudinary Dashboard
 * 4. folderName: Base folder name on Cloudinary (default: "faizan_vault")
 * =========================================================================
 */

const VAULTIX_CONFIG = {
  cloudName: "ix9sq9a9",       // Cloudinary Cloud Name
  uploadPreset: "g6p72bwo",    // Unsigned Upload Preset
  apiKey: "",                 // (Not needed for unsigned upload)
  folderName: "faizan_vault", // Folder created automatically in Cloudinary
  autoUploadToCloud: true,

  // Private Vault Access Credentials
  auth: {
    email: "Faizan0687@gmail.com",
    password: "Faizan@786"
  }
};

// Expose to window for global access across the app
window.VAULTIX_CONFIG = VAULTIX_CONFIG;
