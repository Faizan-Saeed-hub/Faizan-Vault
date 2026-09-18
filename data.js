/**
 * =========================================================================
 * PERSONAL VAULT & GALLERY - DEFAULT ITEMS CONFIGURATION
 * =========================================================================
 * You can directly add, edit, or delete items in this file via code!
 * 
 * Each item has the following structure:
 * {
 *   id: string (unique identifier),
 *   title: string (display title),
 *   category: 'idcard' | 'photo' | 'video' | 'document',
 *   date: string (e.g. '2026-09-18'),
 *   tags: array of strings (e.g. ['official', 'identity']),
 *   description: string,
 *   isDefault: true (indicates pre-loaded default item),
 *   
 *   // For Photos / Documents / Videos:
 *   fileUrl: string (URL or Base64 data URL),
 *   fileType: string (e.g. 'image/jpeg', 'video/mp4', 'application/pdf'),
 *   fileSize: string (e.g. '2.4 MB'),
 *   
 *   // ONLY for ID Cards (Front & Back support):
 *   frontUrl: string (URL or Base64 data URL of Front side),
 *   backUrl: string (URL or Base64 data URL of Back side),
 *   cardNumber: string (e.g. '42201-1234567-1'),
 *   holderName: string (e.g. 'Muhammad Faizan'),
 *   expiryDate: string (e.g. '2032-12-31')
 * }
 * =========================================================================
 */

// Realistic High-Detail SVG for ID Card Front
const SAMPLE_ID_FRONT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230f2027"/>
      <stop offset="50%" stop-color="%23203a43"/>
      <stop offset="100%" stop-color="%232c5364"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ffd700"/>
      <stop offset="100%" stop-color="%23ffae00"/>
    </linearGradient>
    <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23d4af37"/>
      <stop offset="50%" stop-color="%23f9e076"/>
      <stop offset="100%" stop-color="%23b8860b"/>
    </linearGradient>
    <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0,20 Q 10,0 20,20 T 40,20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <path d="M 20,0 Q 0,10 20,20 T 20,40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  
  <!-- Base Card Background -->
  <rect width="856" height="540" rx="28" fill="url(%23cardBg)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <rect width="856" height="540" rx="28" fill="url(%23guilloche)"/>
  
  <!-- Header Bar -->
  <rect x="0" y="0" width="856" height="90" rx="28" fill="rgba(0,0,0,0.25)"/>
  <circle cx="60" cy="46" r="26" fill="url(%23goldGrad)" opacity="0.9"/>
  <text x="60" y="54" font-family="Segoe UI, sans-serif" font-size="24" font-weight="bold" fill="%230f2027" text-anchor="middle">★</text>
  
  <text x="105" y="44" font-family="Segoe UI, sans-serif" font-size="22" font-weight="800" fill="%23ffffff" letter-spacing="3">NATIONAL IDENTITY CARD</text>
  <text x="105" y="68" font-family="Segoe UI, sans-serif" font-size="13" font-weight="500" fill="%2300ffcc" letter-spacing="2">GOVERNMENT CITIZEN SECURE VAULT</text>
  
  <rect x="730" y="24" width="85" height="40" rx="8" fill="rgba(255,255,255,0.1)" stroke="%2300ffcc" stroke-width="1"/>
  <text x="772" y="48" font-family="Segoe UI, sans-serif" font-size="14" font-weight="bold" fill="%2300ffcc" text-anchor="middle">FRONT</text>

  <!-- Smart EMV Chip -->
  <rect x="230" y="145" width="84" height="66" rx="10" fill="url(%23chipGrad)" stroke="%23996515" stroke-width="1.5"/>
  <path d="M 230,178 L 314,178 M 272,145 L 272,211 M 250,145 L 250,211 M 294,145 L 294,211" stroke="%238a6d1c" stroke-width="1.2"/>
  
  <!-- Photo Frame -->
  <rect x="50" y="140" width="145" height="190" rx="16" fill="%231e293b" stroke="%2338bdf8" stroke-width="2.5"/>
  <circle cx="122" cy="210" r="42" fill="%23475569"/>
  <path d="M 75,305 C 75,260 170,260 170,305 Z" fill="%23475569"/>
  <text x="122" y="322" font-family="Segoe UI, sans-serif" font-size="11" font-weight="600" fill="%2394a3b8" text-anchor="middle">OFFICIAL PHOTO</text>

  <!-- Hologram Seal -->
  <circle cx="760" cy="200" r="45" fill="none" stroke="url(%23goldGrad)" stroke-width="2.5" opacity="0.8"/>
  <polygon points="760,170 773,195 800,195 778,210 787,235 760,220 733,235 742,210 720,195 747,195" fill="url(%23goldGrad)" opacity="0.6"/>
  <text x="760" y="260" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" fill="%23ffd700" text-anchor="middle">VERIFIED</text>

  <!-- Details Fields -->
  <g fill="%2394a3b8" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" letter-spacing="1">
    <text x="230" y="248">FULL NAME / نام</text>
    <text x="230" y="325">CARD NUMBER / شناختی کارڈ نمبر</text>
    <text x="230" y="405">DATE OF BIRTH / تاریخ پیدائش</text>
    <text x="440" y="405">GENDER / جنس</text>
    <text x="590" y="405">COUNTRY / ملک</text>
    <text x="230" y="475">DATE OF EXPIRY / میعاد کی تاریخ</text>
    <text x="440" y="475">STATUS / حیثیت</text>
  </g>
  
  <g fill="%23ffffff" font-family="Segoe UI, sans-serif" font-weight="700">
    <text x="230" y="278" font-size="22" letter-spacing="1.5">MUHAMMAD FAIZAN</text>
    <text x="230" y="358" font-size="24" letter-spacing="3" fill="%2338bdf8">42201-9876543-1</text>
    <text x="230" y="433" font-size="17">15.08.1998</text>
    <text x="440" y="433" font-size="17">MALE / M</text>
    <text x="590" y="433" font-size="17">PAKISTAN</text>
    <text x="230" y="503" font-size="17" fill="%2310b981">31.12.2032 (LIFETIME)</text>
    <text x="440" y="503" font-size="17" fill="%2338bdf8">CITIZEN</text>
  </g>
  
  <!-- Micro Security Print Bottom -->
  <text x="50" y="515" font-family="Segoe UI, sans-serif" font-size="10" fill="rgba(255,255,255,0.4)" letter-spacing="4">SECURE VAULT ENCRYPTED DOCUMENT • ORIGINAL COPY</text>
</svg>`;

// Realistic High-Detail SVG for ID Card Back
const SAMPLE_ID_BACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540">
  <defs>
    <linearGradient id="cardBackBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231a2634"/>
      <stop offset="50%" stop-color="%23111827"/>
      <stop offset="100%" stop-color="%230b0f19"/>
    </linearGradient>
    <pattern id="backPattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1.5" fill="rgba(255,255,255,0.06)"/>
    </pattern>
  </defs>
  
  <rect width="856" height="540" rx="28" fill="url(%23cardBackBg)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <rect width="856" height="540" rx="28" fill="url(%23backPattern)"/>
  
  <!-- Magnetic Strip -->
  <rect x="0" y="45" width="856" height="75" fill="%2305070a"/>
  
  <!-- Header Tag -->
  <rect x="730" y="135" width="85" height="35" rx="8" fill="rgba(255,255,255,0.1)" stroke="%23f59e0b" stroke-width="1"/>
  <text x="772" y="158" font-family="Segoe UI, sans-serif" font-size="14" font-weight="bold" fill="%23f59e0b" text-anchor="middle">BACK</text>

  <!-- Address Information -->
  <g fill="%2394a3b8" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" letter-spacing="1">
    <text x="50" y="155">PRESENT ADDRESS / موجودہ پتہ:</text>
    <text x="50" y="225">PERMANENT ADDRESS / مستقل پتہ:</text>
    <text x="50" y="295">AUTHORITY SIGNATURE / مجاز دستخط:</text>
    <text x="450" y="295">DATE OF ISSUE / تاریخ اجراء:</text>
  </g>
  
  <g fill="%23ffffff" font-family="Segoe UI, sans-serif" font-weight="600" font-size="15">
    <text x="50" y="180">House %23 124, Sector F-8/2, Islamabad Capital Territory, Pakistan</text>
    <text x="50" y="250">House %23 124, Sector F-8/2, Islamabad Capital Territory, Pakistan</text>
    <text x="450" y="320" font-size="17" fill="%2338bdf8">15.01.2022</text>
  </g>

  <!-- Simulated Signature -->
  <path d="M 60,325 Q 90,305 120,335 T 180,310 T 230,330" fill="none" stroke="%2338bdf8" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Barcode Simulation -->
  <g fill="%23ffffff">
    <rect x="580" y="200" width="4" height="65"/>
    <rect x="588" y="200" width="8" height="65"/>
    <rect x="600" y="200" width="3" height="65"/>
    <rect x="607" y="200" width="6" height="65"/>
    <rect x="618" y="200" width="10" height="65"/>
    <rect x="632" y="200" width="4" height="65"/>
    <rect x="640" y="200" width="7" height="65"/>
    <rect x="652" y="200" width="3" height="65"/>
    <rect x="660" y="200" width="12" height="65"/>
    <rect x="677" y="200" width="5" height="65"/>
    <rect x="686" y="200" width="8" height="65"/>
    <rect x="698" y="200" width="3" height="65"/>
    <rect x="705" y="200" width="9" height="65"/>
    <rect x="718" y="200" width="4" height="65"/>
    <rect x="726" y="200" width="11" height="65"/>
    <rect x="741" y="200" width="4" height="65"/>
    <rect x="750" y="200" width="8" height="65"/>
    <rect x="762" y="200" width="5" height="65"/>
    <rect x="772" y="200" width="9" height="65"/>
    <text x="680" y="282" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="%2394a3b8" text-anchor="middle">4220198765431</text>
  </g>

  <!-- MRZ (Machine Readable Zone) -->
  <rect x="35" y="380" width="786" height="125" rx="12" fill="%23050811" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <g font-family="Courier New, monospace" font-size="20" font-weight="bold" fill="%2300ffcc" letter-spacing="4">
    <text x="55" y="425">I&lt;PAK4220198765&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="55" y="465">9808157M3212318PAK&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</text>
    <text x="55" y="495">FAIZAN&lt;&lt;MUHAMMAD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
  </g>
</svg>`;

// Sample PDF Data URL for instant in-app preview
const SAMPLE_CERTIFICATE_PDF_DATA = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4gZW5kb2JqCjIgMCBvYmogPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBvYmogPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4gZW5kb2JqCjQgMCBvYmogPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+IGVuZG9iago1IDAgb2JqIDw8IC9MZW5ndGggMTIwID4+IHN0cmVhbQpCVAovRjEgMjAgVGYKNTAgNzIwIFRkCihGQUlaQU4gVkFVTFQgLSBDRVJUSUZJQ0FURSBPRiBBQ0hJRVZFTUVOVCkgVGoKMCAtMzAgVGQKL0YxIDEyIFRmCihWZXJpZmllZCBTZWN1cmUgRG9jdW1lbnQgLSBNdWhhbW1hZCBGYWl6YW4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU4IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCjAwMDAwMDAyMzQgMDAwMDAgbgowMDAwMDAwMzA1IDAwMDAwIG4KdHJhaWxlciA8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0NzUKJSVFT0Y=';

/**
 * DEFAULT_GALLERY_ITEMS
 * Starts completely empty so only user-uploaded items appear in the vault.
 */
const DEFAULT_GALLERY_ITEMS = [];

// Attach to window
window.DEFAULT_GALLERY_ITEMS = DEFAULT_GALLERY_ITEMS;

/**
 * =========================================================================
 * CLOUDINARY CLOUD STORAGE CONFIGURATION (CODE-LEVEL)
 * =========================================================================
 * You can configure your Cloudinary credentials right here in code,
 * or via the "Cloud Storage" settings modal in the web app.
 *
 * 1. cloudName: Your Cloudinary Cloud Name (e.g. 'dxyz1234')
 * 2. uploadPreset: An unsigned upload preset name (e.g. 'faizan_vault')
 *    (Create in Cloudinary Console: Settings -> Upload -> Add upload preset -> Signing Mode: Unsigned)
 * 3. apiKey: Optional (e.g. '123456789012345')
 * 4. folderName: Base folder name where files will be stored (default: 'faizan_vault')
 * =========================================================================
 */
const CLOUDINARY_CONFIG = {
  cloudName: "ix9sq9a9",
  uploadPreset: "g6p72bwo",
  apiKey: "",
  folderName: "faizan_vault"
};

window.DEFAULT_CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;

