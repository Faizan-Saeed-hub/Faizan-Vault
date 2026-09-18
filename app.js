/**
 * =========================================================================
 * VAULTIX - PERSONAL VAULT & GALLERY CORE APPLICATION
 * =========================================================================
 * Features:
 * - Persistent IndexedDB Storage (No 5MB LocalStorage limit)
 * - Dual-sided ID Card 3D Flip Viewer & Dual-side Upload
 * - Multi-format media previews (Photos, Videos, PDFs, Documents)
 * - Instant Live Search, Category Filtering, and Sorting
 * - Full CRUD: Add, View/Preview, Edit, Delete (with Undo), Export/Import
 * =========================================================================
 */

// =========================================================================
// 1. INDEXED-DB STORAGE ENGINE
// =========================================================================
class VaultDB {
  constructor() {
    this.dbName = 'VaultixPersonalDB';
    this.dbVersion = 1;
    this.storeName = 'vault_items';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async get(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

// =========================================================================
// 2. MAIN APPLICATION STATE & LOGIC
// =========================================================================
class VaultixApp {
  constructor() {
    this.db = new VaultDB();
    this.items = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'newest';
    
    // Featured ID Card State
    this.featuredCardId = null;
    this.featuredIsFlipped = false;
    
    // Lightbox & Modal States
    this.currentLightboxItem = null;
    this.lightboxZoomLevel = 1;
    this.lastDeletedItem = null;
    
    // Temporary upload buffers
    this.pendingFrontData = null;
    this.pendingBackData = null;
    this.pendingGeneralData = null;
    this.pendingGeneralFile = null;

    // DOM Elements
    this.dom = {
      // Nav & Search
      searchInput: document.getElementById('globalSearchInput'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      exportBtn: document.getElementById('exportVaultBtn'),
      importBtn: document.getElementById('importVaultBtn'),
      importInput: document.getElementById('importJsonInput'),
      openUploadBtn: document.getElementById('openUploadModalBtn'),
      
      // Hero & Stats
      heroUploadIdBtn: document.getElementById('heroUploadIdBtn'),
      heroUploadMediaBtn: document.getElementById('heroUploadMediaBtn'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
      statIdCard: document.getElementById('statIdCardCount'),
      statPhoto: document.getElementById('statPhotoCount'),
      statVideo: document.getElementById('statVideoCount'),
      statDoc: document.getElementById('statDocCount'),
      
      // Featured Showcase
      featuredSection: document.getElementById('featuredIdSection'),
      showcaseCardTitle: document.getElementById('showcaseCardTitle'),
      showcaseFlipStage: document.getElementById('showcaseFlipStage'),
      showcaseCardInner: document.getElementById('showcaseCardInner'),
      showcaseFrontImg: document.getElementById('showcaseFrontImg'),
      showcaseBackImg: document.getElementById('showcaseBackImg'),
      showcaseCardName: document.getElementById('showcaseCardName'),
      showcaseCardDesc: document.getElementById('showcaseCardDesc'),
      showcaseIdNumber: document.getElementById('showcaseIdNumber'),
      showcaseExpiry: document.getElementById('showcaseExpiry'),
      showcaseCurrentSide: document.getElementById('showcaseCurrentSideText'),
      showcaseFlipBtn: document.getElementById('showcaseFlipBtn'),
      showcaseFlipBtnText: document.getElementById('showcaseFlipBtnText'),
      showcaseViewModalBtn: document.getElementById('showcaseViewModalBtn'),
      showcaseDownloadCombinedBtn: document.getElementById('showcaseDownloadCombinedBtn'),
      showcaseDownloadCombinedImgBtn: document.getElementById('showcaseDownloadCombinedImgBtn'),
      showcaseEditBtn: document.getElementById('showcaseEditBtn'),

      // Filters & Grid
      categoryContainer: document.getElementById('categoryFilterContainer'),
      sortSelect: document.getElementById('sortSelect'),
      galleryGrid: document.getElementById('galleryGrid'),
      
      // Filter Counts
      countAll: document.getElementById('filterCountAll'),
      countIdCard: document.getElementById('filterCountIdCard'),
      countPhoto: document.getElementById('filterCountPhoto'),
      countVideo: document.getElementById('filterCountVideo'),
      countDoc: document.getElementById('filterCountDocument'),

      // Upload Modal
      uploadModal: document.getElementById('uploadModal'),
      closeUploadBtn: document.getElementById('closeUploadModalBtn'),
      cancelUploadBtn: document.getElementById('cancelUploadBtn'),
      uploadForm: document.getElementById('uploadForm'),
      categoryInput: document.getElementById('itemCategoryInput'),
      categoryButtons: document.querySelectorAll('.cat-pick-btn'),
      
      idCardSection: document.getElementById('idCardUploadSection'),
      standardSection: document.getElementById('standardUploadSection'),
      
      frontDropzone: document.getElementById('frontSideDropzone'),
      frontInput: document.getElementById('frontFileInput'),
      frontPreview: document.getElementById('frontSidePreviewImg'),
      
      backDropzone: document.getElementById('backSideDropzone'),
      backInput: document.getElementById('backFileInput'),
      backPreview: document.getElementById('backSidePreviewImg'),
      
      generalDropzone: document.getElementById('generalDropzone'),
      generalInput: document.getElementById('generalFileInput'),
      generalPreviewWrap: document.getElementById('generalFilePreviewWrap'),
      selectedFileName: document.getElementById('selectedFileName'),
      
      itemTitleInput: document.getElementById('itemTitleInput'),
      itemTagsInput: document.getElementById('itemTagsInput'),
      itemDescInput: document.getElementById('itemDescInput'),
      idCardNumberInput: document.getElementById('idCardNumberInput'),
      idCardExpiryInput: document.getElementById('idCardExpiryInput'),

      // Lightbox Modal
      lightboxModal: document.getElementById('lightboxModal'),
      closeLightboxBtn: document.getElementById('closeLightboxBtn'),
      lightboxTypeIcon: document.getElementById('lightboxTypeIcon'),
      lightboxHeaderName: document.getElementById('lightboxHeaderName'),
      lightboxStage: document.getElementById('lightboxStage'),
      lightboxDetailTitle: document.getElementById('lightboxDetailTitle'),
      lightboxDetailDesc: document.getElementById('lightboxDetailDesc'),
      lightboxMetaCategory: document.getElementById('lightboxMetaCategory'),
      lightboxMetaDate: document.getElementById('lightboxMetaDate'),
      lightboxMetaSize: document.getElementById('lightboxMetaSize'),
      lightboxCardNumberRow: document.getElementById('lightboxCardNumberRow'),
      lightboxMetaCardNumber: document.getElementById('lightboxMetaCardNumber'),
      lightboxExpiryRow: document.getElementById('lightboxExpiryRow'),
      lightboxMetaExpiry: document.getElementById('lightboxMetaExpiry'),
      lightboxTags: document.getElementById('lightboxTags'),
      lightboxDownloadBtn: document.getElementById('lightboxDownloadBtn'),
      idCardDownloadGroup: document.getElementById('idCardDownloadGroup'),
      idDownloadCombinedPngBtn: document.getElementById('idDownloadCombinedPngBtn'),
      idDownloadCombinedPdfBtn: document.getElementById('idDownloadCombinedPdfBtn'),
      idDownloadFrontOnlyBtn: document.getElementById('idDownloadFrontOnlyBtn'),
      idDownloadBackOnlyBtn: document.getElementById('idDownloadBackOnlyBtn'),
      lightboxEditBtn: document.getElementById('lightboxEditBtn'),
      lightboxDeleteBtn: document.getElementById('lightboxDeleteBtn'),

      // Edit Modal
      editModal: document.getElementById('editModal'),
      closeEditBtn: document.getElementById('closeEditModalBtn'),
      cancelEditBtn: document.getElementById('cancelEditBtn'),
      editForm: document.getElementById('editForm'),
      editItemId: document.getElementById('editItemId'),
      editTitleInput: document.getElementById('editTitleInput'),
      editCardNumberGroup: document.getElementById('editCardNumberGroup'),
      editCardNumberInput: document.getElementById('editCardNumberInput'),
      editTagsInput: document.getElementById('editTagsInput'),
      editDescInput: document.getElementById('editDescInput'),

      // Cloudinary Cloud Storage Controls
      openCloudinaryBtn: document.getElementById('openCloudinaryBtn'),
      cloudinaryModal: document.getElementById('cloudinaryModal'),
      closeCloudinaryBtn: document.getElementById('closeCloudinaryModalBtn'),
      cancelCloudinaryBtn: document.getElementById('cancelCloudinaryBtn'),
      cloudinaryConfigForm: document.getElementById('cloudinaryConfigForm'),
      cloudNameInput: document.getElementById('cloudNameInput'),
      cloudPresetInput: document.getElementById('cloudPresetInput'),
      cloudApiKeyInput: document.getElementById('cloudApiKeyInput'),
      cloudFolderInput: document.getElementById('cloudFolderInput'),
      cloudStatusIcon: document.getElementById('cloudStatusIcon'),
      cloudStatusBadge: document.getElementById('cloudStatusBadge'),
      cloudStatusText: document.getElementById('cloudStatusText'),
      
      uploadProgressWrap: document.getElementById('uploadProgressWrap'),
      uploadProgressStatusText: document.getElementById('uploadProgressStatusText'),
      uploadProgressPercent: document.getElementById('uploadProgressPercent'),
      uploadProgressBarFill: document.getElementById('uploadProgressBarFill'),

      // Toasts
      toastContainer: document.getElementById('toastContainer'),

      // Authentication Lock Screen
      authOverlay: document.getElementById('authOverlay'),
      authCard: document.getElementById('authCard'),
      authLoginForm: document.getElementById('authLoginForm'),
      authEmailInput: document.getElementById('authEmailInput'),
      authPasswordInput: document.getElementById('authPasswordInput'),
      authTogglePwdBtn: document.getElementById('authTogglePwdBtn'),
      authRememberMe: document.getElementById('authRememberMe'),
      authSubmitBtn: document.getElementById('authSubmitBtn'),
      authErrorMsg: document.getElementById('authErrorMsg'),
      authErrorText: document.getElementById('authErrorText'),
      authLogoutBtn: document.getElementById('authLogoutBtn')
    };

    // Cloudinary Config Initialization
    this.cloudinaryConfig = this.loadCloudinaryConfig();

    this.init();
  }

  async init() {
    try {
      await this.db.init();
      const existingItems = await this.db.getAll();

      if (!existingItems || existingItems.length === 0) {
        // Seed default items from window.DEFAULT_GALLERY_ITEMS in data.js
        console.log('Seeding initial items from data.js...');
        const defaults = window.DEFAULT_GALLERY_ITEMS || [];
        for (const item of defaults) {
          await this.db.put(item);
        }
        this.items = defaults;
      } else {
        this.items = existingItems;
      }

      this.setupEventListeners();
      this.updateCloudinaryUIStatus();
      this.checkAuthStatus();
      this.refreshUI();
      this.showToast('Vault ready. Storage loaded successfully.', 'info');
    } catch (err) {
      console.error('Initialization error:', err);
      this.showToast('Error loading storage: ' + err.message, 'error');
    }
  }

  // =========================================================================
  // EVENT LISTENERS SETUP
  // =========================================================================
  setupEventListeners() {
    // Search
    this.dom.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.dom.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
      this.renderGallery();
    });

    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.searchQuery = '';
      this.dom.clearSearchBtn.style.display = 'none';
      this.renderGallery();
    });

    // Category Filter Pills
    this.dom.categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeCategory = btn.dataset.category;
      this.renderGallery();
    });

    // Stats card click filters
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.filterTarget;
        const targetPill = document.querySelector(`.filter-pill[data-category="${cat}"]`);
        if (targetPill) targetPill.click();
      });
    });

    // Sort Select
    this.dom.sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderGallery();
    });

    // Featured ID Card 3D Flip
    this.dom.showcaseFlipStage.addEventListener('click', () => this.toggleFeaturedFlip());
    this.dom.showcaseFlipBtn.addEventListener('click', () => this.toggleFeaturedFlip());

    this.dom.showcaseViewModalBtn.addEventListener('click', () => {
      const item = this.items.find(i => i.id === this.featuredCardId);
      if (item) this.openLightbox(item);
    });

    this.dom.showcaseDownloadCombinedBtn.addEventListener('click', () => {
      const item = this.items.find(i => i.id === this.featuredCardId);
      if (item) this.downloadIdCardCombinedPdf(item);
    });

    this.dom.showcaseDownloadCombinedImgBtn.addEventListener('click', () => {
      const item = this.items.find(i => i.id === this.featuredCardId);
      if (item) this.downloadIdCardCombinedImage(item);
    });

    this.dom.showcaseEditBtn.addEventListener('click', () => {
      const item = this.items.find(i => i.id === this.featuredCardId);
      if (item) this.openEditModal(item);
    });

    // Reset Defaults Button
    this.dom.resetDefaultsBtn.addEventListener('click', () => this.confirmResetDefaults());

    // Export & Import Vault
    this.dom.exportBtn.addEventListener('click', () => this.exportVaultBackup());
    this.dom.importBtn.addEventListener('click', () => this.dom.importInput.click());
    this.dom.importInput.addEventListener('change', (e) => this.importVaultBackup(e));

    // Upload Open & Close
    this.dom.openUploadBtn.addEventListener('click', () => this.openUploadModal('idcard'));
    this.dom.heroUploadIdBtn.addEventListener('click', () => this.openUploadModal('idcard'));
    this.dom.heroUploadMediaBtn.addEventListener('click', () => this.openUploadModal('photo'));

    this.dom.closeUploadBtn.addEventListener('click', () => this.closeUploadModal());
    this.dom.cancelUploadBtn.addEventListener('click', () => this.closeUploadModal());
    this.dom.uploadModal.addEventListener('click', (e) => {
      if (e.target === this.dom.uploadModal) this.closeUploadModal();
    });

    // Upload Type Selector Pills
    this.dom.categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.categoryButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const type = btn.dataset.type;
        this.dom.categoryInput.value = type;
        this.switchUploadType(type);
      });
    });

    // ID Dual Side Upload Handlers
    this.setupDropzone(this.dom.frontDropzone, this.dom.frontInput, (file, dataUrl) => {
      this.pendingFrontData = dataUrl;
      this.pendingFrontFile = file;
      this.dom.frontPreview.src = dataUrl;
      this.dom.frontDropzone.classList.add('has-file');
    });

    this.setupDropzone(this.dom.backDropzone, this.dom.backInput, (file, dataUrl) => {
      this.pendingBackData = dataUrl;
      this.pendingBackFile = file;
      this.dom.backPreview.src = dataUrl;
      this.dom.backDropzone.classList.add('has-file');
    });

    // General Single File Upload
    this.setupDropzone(this.dom.generalDropzone, this.dom.generalInput, (file, dataUrl) => {
      this.pendingGeneralData = dataUrl;
      this.pendingGeneralFile = file;
      this.dom.generalPreviewWrap.style.display = 'block';
      this.dom.selectedFileName.textContent = `Selected: ${file.name} (${this.formatBytes(file.size)})`;
      if (!this.dom.itemTitleInput.value) {
        this.dom.itemTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
      }
    });

    // Upload Form Submit
    this.dom.uploadForm.addEventListener('submit', (e) => this.handleUploadSubmit(e));

    // Lightbox Controls
    this.dom.closeLightboxBtn.addEventListener('click', () => this.closeLightbox());
    this.dom.lightboxModal.addEventListener('click', (e) => {
      if (e.target === this.dom.lightboxModal) this.closeLightbox();
    });

    this.dom.lightboxDownloadBtn.addEventListener('click', () => {
      if (this.currentLightboxItem) this.downloadItem(this.currentLightboxItem);
    });

    // ID Card Combined Single-Page Downloads
    this.dom.idDownloadCombinedPngBtn.addEventListener('click', () => {
      if (this.currentLightboxItem) this.downloadIdCardCombinedImage(this.currentLightboxItem);
    });

    this.dom.idDownloadCombinedPdfBtn.addEventListener('click', () => {
      if (this.currentLightboxItem) this.downloadIdCardCombinedPdf(this.currentLightboxItem);
    });

    this.dom.idDownloadFrontOnlyBtn.addEventListener('click', () => {
      if (this.currentLightboxItem && this.currentLightboxItem.frontUrl) {
        this.downloadFile(this.currentLightboxItem.frontUrl, `${this.currentLightboxItem.title}_Front.png`);
      }
    });

    this.dom.idDownloadBackOnlyBtn.addEventListener('click', () => {
      if (this.currentLightboxItem && this.currentLightboxItem.backUrl) {
        this.downloadFile(this.currentLightboxItem.backUrl, `${this.currentLightboxItem.title}_Back.png`);
      }
    });

    this.dom.lightboxEditBtn.addEventListener('click', () => {
      if (this.currentLightboxItem) {
        const item = this.currentLightboxItem;
        this.closeLightbox();
        this.openEditModal(item);
      }
    });

    this.dom.lightboxDeleteBtn.addEventListener('click', () => {
      if (this.currentLightboxItem) {
        const item = this.currentLightboxItem;
        this.closeLightbox();
        this.deleteItem(item.id);
      }
    });

    // Edit Modal Handlers
    this.dom.closeEditBtn.addEventListener('click', () => this.closeEditModal());
    this.dom.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
    this.dom.editModal.addEventListener('click', (e) => {
      if (e.target === this.dom.editModal) this.closeEditModal();
    });
    this.dom.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));

    // Cloudinary Storage Modal Handlers
    this.dom.openCloudinaryBtn.addEventListener('click', () => this.openCloudinaryModal());
    this.dom.cloudStatusBadge.addEventListener('click', () => this.openCloudinaryModal());
    this.dom.closeCloudinaryBtn.addEventListener('click', () => this.closeCloudinaryModal());
    this.dom.cancelCloudinaryBtn.addEventListener('click', () => this.closeCloudinaryModal());
    this.dom.cloudinaryModal.addEventListener('click', (e) => {
      if (e.target === this.dom.cloudinaryModal) this.closeCloudinaryModal();
    });
    this.dom.cloudinaryConfigForm.addEventListener('submit', (e) => this.handleCloudinarySubmit(e));

    // Authentication Event Handlers
    this.dom.authLoginForm.addEventListener('submit', (e) => this.handleAuthLogin(e));
    this.dom.authTogglePwdBtn.addEventListener('click', () => this.togglePasswordVisibility());
    this.dom.authLogoutBtn.addEventListener('click', () => this.handleAuthLogout());

    // Keyboard navigation (Escape to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeUploadModal();
        this.closeLightbox();
        this.closeEditModal();
        this.closeCloudinaryModal();
      }
    });
  }

  // =========================================================================
  // DRAG AND DROP / FILE PICKER HELPER
  // =========================================================================
  setupDropzone(dropzoneEl, inputEl, onFileLoaded) {
    dropzoneEl.addEventListener('click', () => inputEl.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.remove('dragover');
      });
    });

    dropzoneEl.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.readFile(files[0], onFileLoaded);
      }
    });

    inputEl.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        this.readFile(files[0], onFileLoaded);
      }
    });
  }

  readFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(file, e.target.result);
    };
    reader.readAsDataURL(file);
  }

  // =========================================================================
  // 3D FLIP SHOWCASE LOGIC
  // =========================================================================
  toggleFeaturedFlip() {
    this.featuredIsFlipped = !this.featuredIsFlipped;
    if (this.featuredIsFlipped) {
      this.dom.showcaseCardInner.classList.add('flipped');
      this.dom.showcaseFlipBtnText.textContent = 'Flip to Front Side';
      this.dom.showcaseCurrentSide.textContent = 'Back (Details & MRZ)';
    } else {
      this.dom.showcaseCardInner.classList.remove('flipped');
      this.dom.showcaseFlipBtnText.textContent = 'Flip to Back Side';
      this.dom.showcaseCurrentSide.textContent = 'Front (Chip Face)';
    }
  }

  renderFeaturedCard() {
    const idCards = this.items.filter(i => i.category === 'idcard');
    if (idCards.length === 0) {
      this.dom.featuredSection.style.display = 'none';
      return;
    }

    this.dom.featuredSection.style.display = 'block';

    // Find current featured item or fallback to first ID Card
    let current = idCards.find(i => i.id === this.featuredCardId);
    if (!current) {
      current = idCards[0];
      this.featuredCardId = current.id;
    }

    this.dom.showcaseCardTitle.textContent = current.title;
    this.dom.showcaseFrontImg.src = current.frontUrl || '';
    this.dom.showcaseBackImg.src = current.backUrl || '';
    this.dom.showcaseCardName.textContent = current.holderName || current.title;
    this.dom.showcaseCardDesc.textContent = current.description || 'Verified ID document in secure local storage.';
    this.dom.showcaseIdNumber.textContent = current.cardNumber || 'Not specified';
    this.dom.showcaseExpiry.textContent = current.expiryDate || 'Lifetime';
    
    // Reset flip orientation
    this.featuredIsFlipped = false;
    this.dom.showcaseCardInner.classList.remove('flipped');
    this.dom.showcaseFlipBtnText.textContent = 'Flip to Back Side';
    this.dom.showcaseCurrentSide.textContent = 'Front (Chip Face)';
  }

  // =========================================================================
  // GALLERY RENDERING & FILTERING
  // =========================================================================
  refreshUI() {
    this.updateStats();
    this.renderFeaturedCard();
    this.renderGallery();
  }

  updateStats() {
    const idCards = this.items.filter(i => i.category === 'idcard');
    const photos = this.items.filter(i => i.category === 'photo');
    const videos = this.items.filter(i => i.category === 'video');
    const docs = this.items.filter(i => i.category === 'document');

    this.dom.statIdCard.textContent = idCards.length;
    this.dom.statPhoto.textContent = photos.length;
    this.dom.statVideo.textContent = videos.length;
    this.dom.statDoc.textContent = docs.length;

    this.dom.countAll.textContent = this.items.length;
    this.dom.countIdCard.textContent = idCards.length;
    this.dom.countPhoto.textContent = photos.length;
    this.dom.countVideo.textContent = videos.length;
    this.dom.countDoc.textContent = docs.length;
  }

  getFilteredAndSortedItems() {
    let list = [...this.items];

    // Filter by Category
    if (this.activeCategory !== 'all') {
      list = list.filter(item => item.category === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      list = list.filter(item => {
        const titleMatch = item.title && item.title.toLowerCase().includes(this.searchQuery);
        const descMatch = item.description && item.description.toLowerCase().includes(this.searchQuery);
        const cardMatch = item.cardNumber && item.cardNumber.toLowerCase().includes(this.searchQuery);
        const nameMatch = item.holderName && item.holderName.toLowerCase().includes(this.searchQuery);
        const tagMatch = item.tags && item.tags.some(t => t.toLowerCase().includes(this.searchQuery));
        return titleMatch || descMatch || cardMatch || nameMatch || tagMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (this.sortBy === 'newest') {
        return new Date(b.date || 0) - new Date(a.date || 0);
      } else if (this.sortBy === 'oldest') {
        return new Date(a.date || 0) - new Date(b.date || 0);
      } else if (this.sortBy === 'titleAsc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (this.sortBy === 'titleDesc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return list;
  }

  renderGallery() {
    const list = this.getFilteredAndSortedItems();
    this.dom.galleryGrid.innerHTML = '';

    if (list.length === 0) {
      this.dom.galleryGrid.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">📁</div>
          <h3 class="empty-title">No items found</h3>
          <p class="empty-desc">
            ${this.searchQuery 
              ? `No items match "${this.escapeHtml(this.searchQuery)}". Try searching for another term or clear filter.` 
              : `There are currently no items in this category. Click "Upload File" above to add your first item.`}
          </p>
          <button class="btn btn-primary" onclick="window.vaultApp.openUploadModal('${this.activeCategory === 'all' ? 'idcard' : this.activeCategory}')">
            <span>＋</span>
            <span>Upload New Item</span>
          </button>
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const card = this.createGalleryCard(item);
      this.dom.galleryGrid.appendChild(card);
    });
  }

  createGalleryCard(item) {
    const card = document.createElement('div');
    card.className = 'vault-card';
    card.dataset.id = item.id;

    // Category styling & icons
    let categoryBadgeText = 'FILE';
    let categoryBadgeClass = 'badge-photo';
    let categoryEmoji = '📁';

    if (item.category === 'idcard') {
      categoryBadgeText = 'ID CARD (DUAL-SIDED)';
      categoryBadgeClass = 'badge-idcard';
      categoryEmoji = '🪪';
    } else if (item.category === 'photo') {
      categoryBadgeText = 'PHOTO';
      categoryBadgeClass = 'badge-photo';
      categoryEmoji = '📸';
    } else if (item.category === 'video') {
      categoryBadgeText = 'VIDEO';
      categoryBadgeClass = 'badge-video';
      categoryEmoji = '🎬';
    } else if (item.category === 'document') {
      categoryBadgeText = 'PDF DOCUMENT';
      categoryBadgeClass = 'badge-document';
      categoryEmoji = '📑';
    }

    // Media Thumbnail generation
    let mediaHtml = '';
    let switchBtnHtml = '';

    if (item.category === 'idcard') {
      mediaHtml = `
        <img src="${item.frontUrl || item.backUrl || ''}" alt="${this.escapeHtml(item.title)}" id="cardImg-${item.id}" data-current-side="front">
      `;
      switchBtnHtml = `
        <button class="id-side-switch-btn" data-action="toggle-id-side" data-id="${item.id}" title="Toggle Front / Back View">
          <span>🔄</span>
          <span class="side-name-text">View Back</span>
        </button>
      `;
    } else if (item.category === 'photo') {
      mediaHtml = `
        <img src="${item.fileUrl || ''}" alt="${this.escapeHtml(item.title)}" loading="lazy">
      `;
    } else if (item.category === 'video') {
      mediaHtml = `
        <video src="${item.fileUrl || ''}#t=0.5" preload="metadata" style="width:100%; height:100%; object-fit:cover;"></video>
        <div class="video-play-indicator">▶</div>
      `;
    } else if (item.category === 'document') {
      const hasThumb = item.thumbnailUrl || (item.fileUrl && item.fileUrl.includes('res.cloudinary.com') && item.fileUrl.toLowerCase().endsWith('.pdf'));
      const thumbSrc = item.thumbnailUrl || (hasThumb ? item.fileUrl.replace(/\.pdf(\?.*)?$/i, '.jpg') : '');

      if (thumbSrc) {
        mediaHtml = `
          <img src="${thumbSrc}" alt="${this.escapeHtml(item.title)}" loading="lazy" style="object-fit: cover; width: 100%; height: 100%; background: #1e293b;">
          <div class="pdf-card-badge-overlay">
            <span>📑 PDF</span>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="doc-thumbnail-preview">
            <div class="doc-paper-icon">
              <span class="doc-icon-glyph">📄</span>
            </div>
            <span style="font-size: 0.82rem; font-weight: 700; color: #ffffff; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${this.escapeHtml(item.title)}
            </span>
            <span style="font-size: 0.72rem; color: #38bdf8; margin-top: 0.2rem; font-weight: 600;">
              ${item.fileSize || 'PDF Document'} • Click to Read
            </span>
          </div>
        `;
      }
    }

    // Tags rendering
    const tagsHtml = (item.tags || []).map(t => `<span class="tag-badge">#${this.escapeHtml(t)}</span>`).join('');

    card.innerHTML = `
      <div class="card-media-wrapper" data-action="view-preview" data-id="${item.id}">
        <span class="card-type-badge ${categoryBadgeClass}">
          <span>${categoryEmoji}</span>
          <span>${categoryBadgeText}</span>
        </span>
        
        <div class="card-quick-overlay">
          <button class="quick-btn" data-action="view-preview" data-id="${item.id}" title="Full Preview / View">👁️</button>
          <button class="quick-btn" data-action="edit-item" data-id="${item.id}" title="Edit Info">✏️</button>
          <button class="quick-btn" data-action="download-item" data-id="${item.id}" title="Download">⬇️</button>
          <button class="quick-btn btn-delete-quick" data-action="delete-item" data-id="${item.id}" title="Delete">🗑️</button>
        </div>

        ${mediaHtml}
        ${switchBtnHtml}
      </div>

      <div class="card-content">
        <h4 class="card-title" data-action="view-preview" data-id="${item.id}">${this.escapeHtml(item.title)}</h4>
        <p class="card-description">${this.escapeHtml(item.description || 'No description provided.')}</p>
        
        <div class="card-tags">
          ${tagsHtml}
        </div>

        <div class="card-footer">
          <div class="card-meta-left">
            <span>📅 ${item.date || 'Recent'}</span>
            ${item.fileSize ? `<span>• 💾 ${item.fileSize}</span>` : ''}
          </div>

          <div class="card-actions-row">
            ${item.category === 'idcard' ? `
              <button class="action-icon-btn" data-action="set-featured" data-id="${item.id}" title="Set as Featured ID in Top Banner">⭐</button>
            ` : ''}
            <button class="action-icon-btn" data-action="view-preview" data-id="${item.id}" title="View">👁️</button>
            <button class="action-icon-btn" data-action="edit-item" data-id="${item.id}" title="Edit">✏️</button>
            <button class="action-icon-btn btn-delete" data-action="delete-item" data-id="${item.id}" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `;

    // Bind card interactive actions
    card.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const id = target.dataset.id;
      const clickedItem = this.items.find(i => i.id === id);

      if (!clickedItem) return;

      if (action === 'view-preview') {
        this.openLightbox(clickedItem);
      } else if (action === 'edit-item') {
        this.openEditModal(clickedItem);
      } else if (action === 'delete-item') {
        this.deleteItem(clickedItem.id);
      } else if (action === 'download-item') {
        this.downloadItem(clickedItem);
      } else if (action === 'set-featured') {
        this.featuredCardId = clickedItem.id;
        this.renderFeaturedCard();
        this.showToast(`Set "${clickedItem.title}" as featured ID card!`, 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'toggle-id-side') {
        e.stopPropagation();
        this.toggleCardSideInGrid(clickedItem, target);
      }
    });

    return card;
  }

  toggleCardSideInGrid(item, buttonEl) {
    const imgEl = document.getElementById(`cardImg-${item.id}`);
    const textEl = buttonEl.querySelector('.side-name-text');
    if (!imgEl) return;

    const currentSide = imgEl.dataset.currentSide;
    if (currentSide === 'front') {
      imgEl.src = item.backUrl || item.frontUrl;
      imgEl.dataset.currentSide = 'back';
      if (textEl) textEl.textContent = 'View Front';
    } else {
      imgEl.src = item.frontUrl || item.backUrl;
      imgEl.dataset.currentSide = 'front';
      if (textEl) textEl.textContent = 'View Back';
    }
  }

  // =========================================================================
  // LIGHTBOX & PREVIEW MODAL ("Preview ka bhi option ho aur view karne ka bhi")
  // =========================================================================
  openLightbox(item) {
    this.currentLightboxItem = item;
    this.lightboxZoomLevel = 1;

    // Header info
    this.dom.lightboxHeaderName.textContent = item.title;
    this.dom.lightboxDetailTitle.textContent = item.title;
    this.dom.lightboxDetailDesc.textContent = item.description || 'No notes available.';
    this.dom.lightboxMetaCategory.textContent = item.category.toUpperCase();
    this.dom.lightboxMetaDate.textContent = item.date || 'Unknown';
    this.dom.lightboxMetaSize.textContent = item.fileSize || 'Standard';

    // ID Specific info in sidebar & download buttons toggle
    if (item.category === 'idcard') {
      this.dom.lightboxCardNumberRow.style.display = 'flex';
      this.dom.lightboxExpiryRow.style.display = 'flex';
      this.dom.lightboxMetaCardNumber.textContent = item.cardNumber || 'Not specified';
      this.dom.lightboxMetaExpiry.textContent = item.expiryDate || 'Lifetime';
      this.dom.lightboxTypeIcon.textContent = '🪪';
      
      // Show combined 1-page download buttons for ID Cards
      this.dom.lightboxDownloadBtn.style.display = 'none';
      this.dom.idCardDownloadGroup.style.display = 'flex';
    } else {
      this.dom.lightboxCardNumberRow.style.display = 'none';
      this.dom.lightboxExpiryRow.style.display = 'none';
      if (item.category === 'photo') this.dom.lightboxTypeIcon.textContent = '📸';
      if (item.category === 'video') this.dom.lightboxTypeIcon.textContent = '🎬';
      if (item.category === 'document') this.dom.lightboxTypeIcon.textContent = '📑';

      // Show standard download button for other files
      this.dom.lightboxDownloadBtn.style.display = 'block';
      this.dom.idCardDownloadGroup.style.display = 'none';
    }

    // Tags
    this.dom.lightboxTags.innerHTML = (item.tags || []).map(t => `<span class="tag-badge">#${this.escapeHtml(t)}</span>`).join('');

    // Stage Media Renderer
    this.renderLightboxMedia(item);

    // Show modal
    this.dom.lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  renderLightboxMedia(item) {
    const stage = this.dom.lightboxStage;
    stage.innerHTML = '';

    if (item.category === 'idcard') {
      // 3D Flip Card Viewer inside Lightbox!
      stage.innerHTML = `
        <div class="lightbox-id-flip-container" id="lightboxIdFlipStage" title="Click to Flip Front and Back">
          <div class="lightbox-id-card-inner" id="lightboxIdCardInner">
            <div class="id-card-face id-card-front">
              <span class="flip-hint-overlay">✨ Click card to flip</span>
              <img src="${item.frontUrl || ''}" alt="ID Front">
              <div class="flip-side-indicator">
                <span>🛡️</span>
                <span>FRONT SIDE</span>
              </div>
            </div>
            <div class="id-card-face id-card-back">
              <span class="flip-hint-overlay">✨ Click card to flip</span>
              <img src="${item.backUrl || ''}" alt="ID Back">
              <div class="flip-side-indicator">
                <span>🛡️</span>
                <span>BACK SIDE</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="viewer-controls-bar">
          <button class="viewer-tool-btn" id="lightboxFlipToggleBtn" title="Flip Card Side">🔄 Flip Side</button>
          <button class="viewer-tool-btn" id="lightboxDownloadFrontBtn" title="Download Front Image">⬇️ Front</button>
          <button class="viewer-tool-btn" id="lightboxDownloadBackBtn" title="Download Back Image">⬇️ Back</button>
        </div>
      `;

      let isFlipped = false;
      const flipContainer = document.getElementById('lightboxIdFlipStage');
      const flipInner = document.getElementById('lightboxIdCardInner');
      const flipBtn = document.getElementById('lightboxFlipToggleBtn');

      const doFlip = () => {
        isFlipped = !isFlipped;
        flipInner.classList.toggle('flipped', isFlipped);
      };

      flipContainer.addEventListener('click', doFlip);
      flipBtn.addEventListener('click', doFlip);

      document.getElementById('lightboxDownloadFrontBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadFile(item.frontUrl, `${item.title}_Front.png`);
      });

      document.getElementById('lightboxDownloadBackBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadFile(item.backUrl, `${item.title}_Back.png`);
      });

    } else if (item.category === 'photo') {
      stage.innerHTML = `
        <img src="${item.fileUrl}" id="lightboxZoomImg" alt="${this.escapeHtml(item.title)}">
        <div class="viewer-controls-bar">
          <button class="viewer-tool-btn" id="zoomOutBtn" title="Zoom Out">➖</button>
          <button class="viewer-tool-btn" id="zoomResetBtn" title="Reset Zoom">🔍 100%</button>
          <button class="viewer-tool-btn" id="zoomInBtn" title="Zoom In">➕</button>
        </div>
      `;

      const zoomImg = document.getElementById('lightboxZoomImg');
      document.getElementById('zoomInBtn').addEventListener('click', () => {
        this.lightboxZoomLevel = Math.min(3, this.lightboxZoomLevel + 0.25);
        zoomImg.style.transform = `scale(${this.lightboxZoomLevel})`;
      });
      document.getElementById('zoomOutBtn').addEventListener('click', () => {
        this.lightboxZoomLevel = Math.max(0.5, this.lightboxZoomLevel - 0.25);
        zoomImg.style.transform = `scale(${this.lightboxZoomLevel})`;
      });
      document.getElementById('zoomResetBtn').addEventListener('click', () => {
        this.lightboxZoomLevel = 1;
        zoomImg.style.transform = 'scale(1)';
      });

    } else if (item.category === 'video') {
      stage.innerHTML = `
        <video controls autoplay src="${item.fileUrl}" style="max-width: 95%; max-height: 90%;">
          Your browser does not support the video tag.
        </video>
      `;

    } else if (item.category === 'document') {
      // PDF or Document interactive in-app viewer
      const pdfSourceUrl = item.localDataUrl ? this.createBlobUrlFromData(item.localDataUrl) : item.fileUrl;
      const hasCloudinaryPdf = item.fileUrl && item.fileUrl.includes('res.cloudinary.com') && item.fileUrl.toLowerCase().endsWith('.pdf');
      const cloudJpgThumb = hasCloudinaryPdf ? item.fileUrl.replace(/\.pdf(\?.*)?$/i, '.jpg') : '';

      stage.innerHTML = `
        <div class="pdf-viewer-wrapper">
          <div class="pdf-viewer-header">
            <div class="pdf-header-info">
              <span class="pdf-header-icon">📑</span>
              <div>
                <div class="pdf-header-title">${this.escapeHtml(item.title)}</div>
                <div class="pdf-header-sub">Interactive In-App PDF Reader • ${item.fileSize || 'PDF Document'}</div>
              </div>
            </div>
            <div class="pdf-header-actions">
              <button class="btn btn-primary btn-sm" id="lightboxPdfDownloadDirectBtn" title="Instant Direct Download (No Password Required)">
                <span>⬇️</span>
                <span>Download PDF</span>
              </button>
              <button class="btn btn-secondary btn-sm" id="lightboxPdfPrintBtn" title="Print Document">
                <span>🖨️</span>
                <span>Print</span>
              </button>
              <a href="${pdfSourceUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Open in New Window">
                <span>↗️</span>
                <span>Full Tab</span>
              </a>
            </div>
          </div>
          <div class="pdf-frame-container">
            <iframe id="pdfEmbeddedIframe" src="${pdfSourceUrl}#toolbar=1&navpanes=1" title="${this.escapeHtml(item.title)}" allowfullscreen></iframe>
          </div>
          ${!item.localDataUrl && hasCloudinaryPdf ? `
            <div class="pdf-fallback-notice">
              <span>💡 <strong>Cloudinary Notice:</strong> If your download prompts for username/password, Cloudinary has restricted PDF delivery enabled by default. Uncheck "PDF and ZIP files delivery: Restricted" in Cloudinary Settings ➔ Security, or re-upload the document for offline instant download.</span>
              ${cloudJpgThumb ? `<a href="${cloudJpgThumb}" target="_blank" style="color:#38bdf8; text-decoration:underline; font-weight:600;">View Page 1 Preview Image ↗</a>` : ''}
            </div>
          ` : ''}
        </div>
      `;

      const directDownloadBtn = document.getElementById('lightboxPdfDownloadDirectBtn');
      if (directDownloadBtn) {
        directDownloadBtn.addEventListener('click', () => {
          this.downloadItem(item);
        });
      }

      const printBtn = document.getElementById('lightboxPdfPrintBtn');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          const iframe = document.getElementById('pdfEmbeddedIframe');
          if (iframe && iframe.contentWindow) {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
              return;
            } catch (err) {
              console.warn('Iframe print blocked, opening window', err);
            }
          }
          window.open(pdfSourceUrl, '_blank');
        });
      }
    }
  }

  closeLightbox() {
    this.dom.lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
    // Pause any playing videos
    const vid = this.dom.lightboxStage.querySelector('video');
    if (vid) vid.pause();
    this.currentLightboxItem = null;
  }

  // =========================================================================
  // UPLOAD / ADD NEW ITEM MODAL
  // =========================================================================
  openUploadModal(category = 'idcard') {
    this.resetUploadForm();

    // Select category pill
    const targetBtn = document.querySelector(`.cat-pick-btn[data-type="${category}"]`);
    if (targetBtn) targetBtn.click();

    this.dom.uploadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeUploadModal() {
    this.dom.uploadModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  switchUploadType(type) {
    if (type === 'idcard') {
      this.dom.idCardSection.style.display = 'block';
      this.dom.standardSection.style.display = 'none';
      this.dom.itemTitleInput.placeholder = "e.g. National CNIC Card or Driving License";
    } else {
      this.dom.idCardSection.style.display = 'none';
      this.dom.standardSection.style.display = 'block';

      if (type === 'photo') {
        this.dom.generalDropzoneIcon.textContent = '📸';
        this.dom.generalDropzoneSub.textContent = 'Supports PNG, JPG, WEBP, GIF, SVG';
        this.dom.generalInput.accept = 'image/*';
        this.dom.itemTitleInput.placeholder = "e.g. Family Vacation or Landscape Portrait";
      } else if (type === 'video') {
        this.dom.generalDropzoneIcon.textContent = '🎬';
        this.dom.generalDropzoneSub.textContent = 'Supports MP4, WEBM, OGG, MOV';
        this.dom.generalInput.accept = 'video/*';
        this.dom.itemTitleInput.placeholder = "e.g. Travel Montage or Drone Footage";
      } else if (type === 'document') {
        this.dom.generalDropzoneIcon.textContent = '📑';
        this.dom.generalDropzoneSub.textContent = 'Supports PDF, DOC, TXT';
        this.dom.generalInput.accept = 'application/pdf, text/plain, application/msword';
        this.dom.itemTitleInput.placeholder = "e.g. Degree Certificate or Employment Contract";
      }
    }
  }

  resetUploadForm() {
    this.dom.uploadForm.reset();
    this.pendingFrontData = null;
    this.pendingBackData = null;
    this.pendingGeneralData = null;
    this.pendingGeneralFile = null;

    this.dom.frontPreview.src = '';
    this.dom.frontDropzone.classList.remove('has-file');

    this.dom.backPreview.src = '';
    this.dom.backDropzone.classList.remove('has-file');

    this.dom.generalPreviewWrap.style.display = 'none';
    this.dom.selectedFileName.textContent = '';
  }

  async handleUploadSubmit(e) {
    e.preventDefault();

    const category = this.dom.categoryInput.value;
    const title = this.dom.itemTitleInput.value.trim();
    if (!title) {
      alert('Please provide a title for this item.');
      return;
    }

    const tags = this.dom.itemTagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const description = this.dom.itemDescInput.value.trim();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newItemId = 'vault-item-' + Date.now();

    const isCloudinaryActive = Boolean(this.cloudinaryConfig && this.cloudinaryConfig.cloudName && this.cloudinaryConfig.uploadPreset);

    let newItem = {
      id: newItemId,
      title,
      category,
      date: dateStr,
      tags: tags.length > 0 ? tags : [category],
      description,
      isDefault: false
    };

    // Prepare save button & progress display
    const saveBtn = document.getElementById('saveUploadBtn');
    const originalBtnText = saveBtn.innerHTML;

    try {
      if (isCloudinaryActive) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>⏳</span><span>Uploading to Cloudinary...</span>';
        this.dom.uploadProgressWrap.style.display = 'block';
      }

      if (category === 'idcard') {
        if (!this.pendingFrontData && !this.pendingBackData) {
          alert('Please upload at least the Front side or Back side image for your ID card.');
          if (isCloudinaryActive) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnText;
            this.dom.uploadProgressWrap.style.display = 'none';
          }
          return;
        }

        let frontFinalUrl = this.pendingFrontData || this.pendingBackData;
        let backFinalUrl = this.pendingBackData || this.pendingFrontData;

        if (isCloudinaryActive) {
          if (this.pendingFrontData) {
            this.dom.uploadProgressStatusText.textContent = `☁️ Uploading Front side to Cloudinary [folder: ${this.cloudinaryConfig.folderName || 'faizan_vault'}/idcards]...`;
            const frontUpload = await this.uploadFileToCloudinary(this.pendingFrontFile || this.pendingFrontData, 'idcards', `${title}_Front`);
            frontFinalUrl = frontUpload.secure_url;
          }
          if (this.pendingBackData) {
            this.dom.uploadProgressStatusText.textContent = `☁️ Uploading Back side to Cloudinary [folder: ${this.cloudinaryConfig.folderName || 'faizan_vault'}/idcards]...`;
            const backUpload = await this.uploadFileToCloudinary(this.pendingBackFile || this.pendingBackData, 'idcards', `${title}_Back`);
            backFinalUrl = backUpload.secure_url;
          }
        }

        newItem.frontUrl = frontFinalUrl;
        newItem.backUrl = backFinalUrl;
        newItem.frontDataUrl = this.pendingFrontData;
        newItem.backDataUrl = this.pendingBackData;
        newItem.cardNumber = this.dom.idCardNumberInput.value.trim() || 'Not specified';
        newItem.expiryDate = this.dom.idCardExpiryInput.value || 'Lifetime';
        newItem.fileSize = '1.2 MB';
        newItem.storageType = isCloudinaryActive ? 'cloudinary' : 'local';

      } else {
        if (!this.pendingGeneralData) {
          alert('Please select or drag a file to upload.');
          if (isCloudinaryActive) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnText;
            this.dom.uploadProgressWrap.style.display = 'none';
          }
          return;
        }

        let finalFileUrl = this.pendingGeneralData;
        let finalFileSize = this.pendingGeneralFile ? this.formatBytes(this.pendingGeneralFile.size) : '1.5 MB';

        if (isCloudinaryActive) {
          const subfolder = category === 'photo' ? 'photos' : (category === 'video' ? 'videos' : 'documents');
          this.dom.uploadProgressStatusText.textContent = `☁️ Uploading ${category} to Cloudinary [folder: ${this.cloudinaryConfig.folderName || 'faizan_vault'}/${subfolder}]...`;
          
          const fileToUpload = this.pendingGeneralFile || this.pendingGeneralData;
          const cloudUpload = await this.uploadFileToCloudinary(fileToUpload, subfolder, title);
          finalFileUrl = cloudUpload.secure_url;
          if (cloudUpload.bytes) {
            finalFileSize = this.formatBytes(cloudUpload.bytes);
          }
        }

        newItem.fileUrl = finalFileUrl;
        newItem.localDataUrl = this.pendingGeneralData;
        newItem.fileName = this.pendingGeneralFile ? this.pendingGeneralFile.name : (title + (category === 'document' ? '.pdf' : ''));
        newItem.fileType = this.pendingGeneralFile ? this.pendingGeneralFile.type : (category === 'document' ? 'application/pdf' : '');
        newItem.fileSize = finalFileSize;
        newItem.storageType = isCloudinaryActive ? 'cloudinary' : 'local';

        if (category === 'document' && isCloudinaryActive && finalFileUrl && finalFileUrl.includes('.pdf')) {
          newItem.thumbnailUrl = finalFileUrl.replace(/\.pdf(\?.*)?$/i, '.jpg');
        }
      }

      await this.db.put(newItem);
      this.items.unshift(newItem);

      if (category === 'idcard') {
        this.featuredCardId = newItem.id;
      }

      this.closeUploadModal();
      this.refreshUI();

      if (isCloudinaryActive) {
        this.showToast(`Uploaded to Cloudinary (folder: ${this.cloudinaryConfig.folderName}) and saved!`, 'success');
      } else {
        this.showToast(`Saved "${newItem.title}" locally! (Configure Cloudinary in settings to upload to cloud)`, 'success');
      }

    } catch (err) {
      console.error('Error saving item:', err);
      this.showToast('Upload failed: ' + err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnText;
      this.dom.uploadProgressWrap.style.display = 'none';
      this.dom.uploadProgressBarFill.style.width = '0%';
      this.dom.uploadProgressPercent.textContent = '0%';
    }
  }

  // =========================================================================
  // CLOUDINARY STORAGE ENGINE & MODAL
  // =========================================================================
  loadCloudinaryConfig() {
    if (window.VAULTIX_CONFIG && window.VAULTIX_CONFIG.cloudName && window.VAULTIX_CONFIG.uploadPreset) {
      return { ...window.VAULTIX_CONFIG };
    }
    const saved = localStorage.getItem('vaultix_cloudinary_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.cloudName || parsed.uploadPreset)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored Cloudinary config', e);
      }
    }
    return {
      cloudName: 'ix9sq9a9',
      uploadPreset: 'g6p72bwo',
      apiKey: '',
      folderName: 'faizan_vault'
    };
  }

  saveCloudinaryConfig(config) {
    this.cloudinaryConfig = config;
    localStorage.setItem('vaultix_cloudinary_config', JSON.stringify(config));
    this.updateCloudinaryUIStatus();
  }

  updateCloudinaryUIStatus() {
    const isConnected = Boolean(this.cloudinaryConfig && this.cloudinaryConfig.cloudName && this.cloudinaryConfig.uploadPreset);
    const folder = (this.cloudinaryConfig && this.cloudinaryConfig.folderName) || 'faizan_vault';

    if (isConnected) {
      this.dom.cloudStatusIcon.textContent = '☁️';
      this.dom.cloudStatusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      this.dom.cloudStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      this.dom.cloudStatusBadge.style.color = '#34d399';
      this.dom.cloudStatusText.textContent = `Cloudinary: Connected (${folder})`;
    } else {
      this.dom.cloudStatusIcon.textContent = '⚙️';
      this.dom.cloudStatusBadge.style.background = 'rgba(6, 182, 212, 0.12)';
      this.dom.cloudStatusBadge.style.borderColor = 'rgba(6, 182, 212, 0.3)';
      this.dom.cloudStatusBadge.style.color = '#38bdf8';
      this.dom.cloudStatusText.textContent = 'Cloudinary: Ready to Connect';
    }
  }

  openCloudinaryModal() {
    this.dom.cloudNameInput.value = this.cloudinaryConfig.cloudName || '';
    this.dom.cloudPresetInput.value = this.cloudinaryConfig.uploadPreset || '';
    this.dom.cloudApiKeyInput.value = this.cloudinaryConfig.apiKey || '';
    this.dom.cloudFolderInput.value = this.cloudinaryConfig.folderName || 'faizan_vault';

    this.dom.cloudinaryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeCloudinaryModal() {
    this.dom.cloudinaryModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  handleCloudinarySubmit(e) {
    e.preventDefault();
    const cloudName = this.dom.cloudNameInput.value.trim();
    const uploadPreset = this.dom.cloudPresetInput.value.trim();
    const apiKey = this.dom.cloudApiKeyInput.value.trim();
    const folderName = this.dom.cloudFolderInput.value.trim() || 'faizan_vault';

    if (!cloudName || !uploadPreset) {
      alert('Please provide your Cloudinary Cloud Name and Upload Preset name.');
      return;
    }

    this.saveCloudinaryConfig({
      cloudName,
      uploadPreset,
      apiKey,
      folderName
    });

    this.closeCloudinaryModal();
    this.showToast(`Cloudinary configured! Uploads will be stored in folder "${folderName}".`, 'success');
  }

  async uploadFileToCloudinary(fileOrDataUrl, subfolder, title) {
    if (!this.cloudinaryConfig.cloudName || !this.cloudinaryConfig.uploadPreset) {
      throw new Error('Cloudinary is not configured. Please open Cloud Storage settings.');
    }

    const targetFolder = `${this.cloudinaryConfig.folderName || 'faizan_vault'}/${subfolder}`;
    const endpoint = `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/auto/upload`;

    const formData = new FormData();
    formData.append('file', fileOrDataUrl);
    formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
    formData.append('folder', targetFolder);
    if (this.cloudinaryConfig.apiKey) {
      formData.append('api_key', this.cloudinaryConfig.apiKey);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          this.dom.uploadProgressBarFill.style.width = `${percent}%`;
          this.dom.uploadProgressPercent.textContent = `${percent}%`;
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (err) {
            reject(new Error('Invalid response from Cloudinary.'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error ? errData.error.message : `Cloudinary error (${xhr.status})`));
          } catch (e) {
            reject(new Error(`Cloudinary upload failed with status ${xhr.status}. Check your Cloud Name and Preset.`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during Cloudinary upload.'));
      };

      xhr.send(formData);
    });
  }

  // =========================================================================
  // EDIT ITEM DETAILS
  // =========================================================================
  openEditModal(item) {
    this.dom.editItemId.value = item.id;
    this.dom.editTitleInput.value = item.title || '';
    this.dom.editTagsInput.value = (item.tags || []).join(', ');
    this.dom.editDescInput.value = item.description || '';

    if (item.category === 'idcard') {
      this.dom.editCardNumberGroup.style.display = 'block';
      this.dom.editCardNumberInput.value = item.cardNumber || '';
    } else {
      this.dom.editCardNumberGroup.style.display = 'none';
    }

    this.dom.editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeEditModal() {
    this.dom.editModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  async handleEditSubmit(e) {
    e.preventDefault();
    const id = this.dom.editItemId.value;
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    item.title = this.dom.editTitleInput.value.trim();
    item.description = this.dom.editDescInput.value.trim();
    item.tags = this.dom.editTagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (item.category === 'idcard') {
      item.cardNumber = this.dom.editCardNumberInput.value.trim();
    }

    try {
      await this.db.put(item);
      this.closeEditModal();
      this.refreshUI();
      this.showToast(`Updated "${item.title}" successfully!`, 'success');
    } catch (err) {
      this.showToast('Error updating item: ' + err.message, 'error');
    }
  }

  // =========================================================================
  // DELETE ITEM (WITH UNDO TOAST)
  // =========================================================================
  async deleteItem(id) {
    const itemIndex = this.items.findIndex(i => i.id === id);
    if (itemIndex === -1) return;

    const itemToDelete = this.items[itemIndex];
    const confirmed = confirm(`Are you sure you want to delete "${itemToDelete.title}"?`);
    if (!confirmed) return;

    try {
      await this.db.delete(id);
      this.items.splice(itemIndex, 1);
      this.lastDeletedItem = { item: itemToDelete, index: itemIndex };

      this.refreshUI();
      this.showToast(`Deleted "${itemToDelete.title}"`, 'info', true);
    } catch (err) {
      this.showToast('Error deleting item: ' + err.message, 'error');
    }
  }

  async undoLastDelete() {
    if (!this.lastDeletedItem) return;
    const { item, index } = this.lastDeletedItem;
    try {
      await this.db.put(item);
      this.items.splice(index, 0, item);
      this.lastDeletedItem = null;
      this.refreshUI();
      this.showToast(`Restored "${item.title}"!`, 'success');
    } catch (err) {
      this.showToast('Failed to restore item: ' + err.message, 'error');
    }
  }

  // =========================================================================
  // DOWNLOAD ITEM HELPER & COMBINED 1-PAGE GENERATORS
  // =========================================================================
  downloadItem(item) {
    if (item.category === 'idcard') {
      // Default to combined single-page image for ID cards
      this.downloadIdCardCombinedImage(item);
    } else {
      let ext = 'bin';
      if (item.fileType) {
        if (item.fileType.includes('pdf')) ext = 'pdf';
        else if (item.fileType.includes('png')) ext = 'png';
        else if (item.fileType.includes('jpeg') || item.fileType.includes('jpg')) ext = 'jpg';
        else if (item.fileType.includes('mp4')) ext = 'mp4';
        else ext = item.fileType.split('/')[1] || 'bin';
      } else if (item.category === 'document') {
        ext = 'pdf';
      } else if (item.category === 'photo') {
        ext = 'jpg';
      } else if (item.category === 'video') {
        ext = 'mp4';
      }

      let filename = `${(item.title || 'download').trim().replace(/\s+/g, '_')}`;
      if (!filename.toLowerCase().endsWith(`.${ext}`)) {
        filename += `.${ext}`;
      }

      // If we have local Data URL, download via Blob so IDM avoids Cloudinary 401 and never prompts for credentials!
      if (item.localDataUrl) {
        this.downloadBlobOrDataUrl(item.localDataUrl, filename);
        return;
      }

      // If remote / Cloudinary URL
      if (item.fileUrl) {
        this.downloadFile(item.fileUrl, filename);
      }
    }
  }

  async downloadIdCardCombinedImage(item) {
    this.showToast('Generating clean 1-page combined image...', 'info');

    try {
      // Helper to load image
      const loadImage = (url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load card image for rendering.'));
        img.src = url;
      });

      const frontImg = await loadImage(item.frontUrl || item.backUrl);
      const backImg = await loadImage(item.backUrl || item.frontUrl);

      // Card dimensions (standard crisp width 1000px, aspect ratio preserved)
      const cardWidth = 1000;
      const frontRatio = (frontImg.naturalHeight && frontImg.naturalWidth) ? (frontImg.naturalHeight / frontImg.naturalWidth) : 0.63;
      const backRatio = (backImg.naturalHeight && backImg.naturalWidth) ? (backImg.naturalHeight / backImg.naturalWidth) : 0.63;

      const frontHeight = Math.round(cardWidth * frontRatio);
      const backHeight = Math.round(cardWidth * backRatio);

      const marginX = 50;
      const marginY = 50;
      const gapBetween = 40;

      const canvas = document.createElement('canvas');
      canvas.width = cardWidth + (marginX * 2);
      canvas.height = marginY + frontHeight + gapBetween + backHeight + marginY;
      const ctx = canvas.getContext('2d');

      // Crisp plain clean white background - strictly no headers, no labels, no footers
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Front Card (centered, pure card image)
      ctx.drawImage(frontImg, marginX, marginY, cardWidth, frontHeight);

      // Draw Back Card (centered beneath front card, pure card image)
      ctx.drawImage(backImg, marginX, marginY + frontHeight + gapBetween, cardWidth, backHeight);

      // Trigger PNG Download
      const combinedDataUrl = canvas.toDataURL('image/png');
      const filename = `${item.title.replace(/\s+/g, '_')}_1Page.png`;
      this.downloadFile(combinedDataUrl, filename);
      this.showToast(`Downloaded plain 1-page combined image: ${filename}`, 'success');

    } catch (err) {
      console.error('Error generating combined image:', err);
      this.showToast('Could not combine images: ' + err.message, 'error');
    }
  }

  downloadIdCardCombinedPdf(item) {
    this.showToast('Preparing clean 1-page printable PDF...', 'info');

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Popup blocker prevented opening the PDF print window. Please allow popups for this site.');
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${item.title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 20mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background: #ffffff;
            color: #000000;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .card-block {
            margin-bottom: 30px;
            text-align: center;
          }
          .card-block:last-child {
            margin-bottom: 0;
          }
          .card-img {
            width: 100%;
            max-width: 620px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="width: 100%; max-width: 620px; background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px 18px; margin-bottom: 25px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif;">
          <span style="font-size: 14px; font-weight: 600; color: #0369a1;">📄 Plain 1-Page PDF Ready. Destination: "Save as PDF".</span>
          <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer;">🖨️ Save as PDF</button>
        </div>

        <div class="card-block">
          <img class="card-img" src="${item.frontUrl}" alt="ID Front">
        </div>

        <div class="card-block">
          <img class="card-img" src="${item.backUrl}" alt="ID Back">
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  createBlobUrlFromData(dataUrl) {
    try {
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn('Error creating Blob URL:', e);
    }
    return dataUrl;
  }

  downloadBlobOrDataUrl(dataUrl, filename) {
    try {
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        this.showToast(`Downloaded: ${filename}`, 'success');
        return;
      }
    } catch (e) {
      console.warn('Error in downloadBlobOrDataUrl:', e);
    }
    this.downloadFile(dataUrl, filename);
  }

  // =========================================================================
  // BACKUP & RESTORE JSON
  // =========================================================================
  exportVaultBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.items, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Vaultix_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast('Vault backup JSON exported!', 'success');
  }

  importVaultBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            await this.db.put(item);
          }
          this.items = await this.db.getAll();
          this.refreshUI();
          this.showToast(`Successfully imported ${imported.length} items!`, 'success');
        } else {
          alert('Invalid JSON backup file structure.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async confirmResetDefaults() {
    const confirmed = confirm('Do you want to restore default items configured in data.js? This will reload sample ID cards, photos, videos, and PDFs.');
    if (!confirmed) return;

    try {
      await this.db.clear();
      const defaults = window.DEFAULT_GALLERY_ITEMS || [];
      for (const item of defaults) {
        await this.db.put(item);
      }
      this.items = defaults;
      this.featuredCardId = null;
      this.refreshUI();
      this.showToast('Reset to default items successfully!', 'success');
    } catch (err) {
      this.showToast('Reset error: ' + err.message, 'error');
    }
  }

  // =========================================================================
  // UTILITIES & TOAST NOTIFICATION
  // =========================================================================
  showToast(message, type = 'info', allowUndo = false) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span>${icon}</span>
      <span>${this.escapeHtml(message)}</span>
      ${allowUndo ? '<button class="toast-undo-btn" id="toastUndoBtn">UNDO</button>' : ''}
    `;

    this.dom.toastContainer.appendChild(toast);

    if (allowUndo) {
      const undoBtn = toast.querySelector('#toastUndoBtn');
      undoBtn.addEventListener('click', () => {
        this.undoLastDelete();
        toast.remove();
      });
    }

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  formatBytes(bytes, decimals = 1) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // AUTHENTICATION SYSTEM METHODS
  // =========================================================================
  checkAuthStatus() {
    const isSessionAuth = sessionStorage.getItem('vaultix_auth_session') === 'true';
    const isLocalAuth = localStorage.getItem('vaultix_auth_session') === 'true';

    // Ensure input fields start clean (no browser prefilled text as requested)
    this.dom.authEmailInput.value = '';
    this.dom.authPasswordInput.value = '';

    if (isSessionAuth || isLocalAuth) {
      this.dom.authOverlay.classList.remove('active');
    } else {
      this.dom.authOverlay.classList.add('active');
    }
  }

  handleAuthLogin(e) {
    e.preventDefault();

    const enteredEmail = this.dom.authEmailInput.value.trim().toLowerCase();
    const enteredPassword = this.dom.authPasswordInput.value;

    // Configured Credentials (from config.js or default fallback)
    const validEmail = (window.VAULTIX_CONFIG && window.VAULTIX_CONFIG.auth && window.VAULTIX_CONFIG.auth.email 
      ? window.VAULTIX_CONFIG.auth.email 
      : 'faizan0687@gmail.com').toLowerCase();

    const validPassword = (window.VAULTIX_CONFIG && window.VAULTIX_CONFIG.auth && window.VAULTIX_CONFIG.auth.password 
      ? window.VAULTIX_CONFIG.auth.password 
      : 'Faizan@786');

    if (enteredEmail === validEmail && enteredPassword === validPassword) {
      // Credentials Match!
      this.dom.authErrorMsg.style.display = 'none';

      // Save session
      if (this.dom.authRememberMe.checked) {
        localStorage.setItem('vaultix_auth_session', 'true');
      } else {
        sessionStorage.setItem('vaultix_auth_session', 'true');
      }

      // Smooth Unlock Transition
      this.dom.authOverlay.classList.add('unlocking');
      setTimeout(() => {
        this.dom.authOverlay.classList.remove('active');
        this.dom.authOverlay.classList.remove('unlocking');
        // Clear fields for security
        this.dom.authEmailInput.value = '';
        this.dom.authPasswordInput.value = '';
        this.showToast('Welcome back, Muhammad Faizan!', 'success');
      }, 450);

    } else {
      // Invalid Credentials
      this.dom.authErrorMsg.style.display = 'flex';
      this.dom.authErrorText.textContent = 'Invalid email or password. Access Denied.';
      
      // Trigger card shake animation
      this.dom.authCard.classList.add('shake');
      setTimeout(() => {
        this.dom.authCard.classList.remove('shake');
      }, 500);

      this.dom.authPasswordInput.value = '';
      this.dom.authPasswordInput.focus();
    }
  }

  handleAuthLogout() {
    sessionStorage.removeItem('vaultix_auth_session');
    localStorage.removeItem('vaultix_auth_session');

    this.dom.authEmailInput.value = '';
    this.dom.authPasswordInput.value = '';
    this.dom.authErrorMsg.style.display = 'none';

    this.dom.authOverlay.classList.add('active');
    this.showToast('Vault locked successfully.', 'info');
  }

  togglePasswordVisibility() {
    const isPassword = this.dom.authPasswordInput.type === 'password';
    this.dom.authPasswordInput.type = isPassword ? 'text' : 'password';
    this.dom.authTogglePwdBtn.textContent = isPassword ? '🙈' : '👁️';
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.vaultApp = new VaultixApp();
});
