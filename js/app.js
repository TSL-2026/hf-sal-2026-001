/*
  File: app.js
  Path: /js/app.js
  Purpose: Main application controller - UI state management, screen navigation, event handlers, initialization
  Developer: Ghanshyam Acharya, 2026
  Description: Orchestrates all modules, handles UI rendering, modal controls, and application initialization
*/

const UI = {
  /**
   * Initialize the application
   */
  init: function() {
    CaseLibrary.init();
    this.setupEventListeners();
    this.showScreen('screen-builder');
  },
  
  /**
   * Setup global event listeners
   */
  setupEventListeners: function() {
    // PDF upload zone
    const dropZone = document.getElementById('upload-zone');
    const pdfInput = document.getElementById('pdf-input');
    
    if (dropZone) {
      dropZone.addEventListener('click', () => pdfInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
          PDFProcessor.processPDF(file);
        } else {
          alert('Please drop a PDF file.');
        }
      });
    }
    
    if (pdfInput) {
      pdfInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
          PDFProcessor.processPDF(e.target.files[0]);
        }
      });
    }
  },
  
  /**
   * Show a specific screen
   * @param {string} screenId - ID of screen element
   */
  showScreen: function(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  },
  
  /**
   * Show the builder screen
   */
  showBuilder: function() {
    this.showScreen('screen-builder');
  },
  
  /**
   * Show builder with current case data
   */
  showBuilderWithCurrent: function() {
    this.showScreen('screen-builder');
    document.getElementById('generated-preview').style.display = 'block';
    document.getElementById('extraction-progress').style.display = 'none';
    this.renderPreviewScenario();
    this.renderPreviewCards();
  },
  
  /**
   * Show builder with specific case data
   * @param {object} caseData - Case to edit
   */
  showBuilderWithCase: function(caseData) {
    CaseEditor.setFromCase(caseData);
    this.showBuilderWithCurrent();
  },
  
  /**
   * Render scenario preview in builder
   */
  renderPreviewScenario: function() {
    const container = document.getElementById('preview-scenario');
    if (!container) return;
    container.innerHTML = `
      <div class="preview-card-header">
        <span class="preview-card-category">SCENARIO</span>
        <button class="edit-btn" onclick="UI.editScenario()">✏️ Edit</button>
      </div>
      <div class="preview-card-title">${Utils.escapeHtml(CaseEditor.currentTitle)} (${Utils.escapeHtml(CaseEditor.currentYear)})</div>
      <div class="preview-card-question">${Utils.escapeHtml(Utils.truncate(CaseEditor.currentScenario, 300))}</div>
    `;
  },
  
  /**
   * Render cards preview in builder
   */
  renderPreviewCards: function() {
    const container = document.getElementById('preview-cards');
    if (!container) return;
    container.innerHTML = CaseEditor.currentCards.map((card, idx) => `
      <div class="preview-card">
        <div class="preview-card-header">
          <span class="preview-card-category">${Utils.escapeHtml(card.category)}</span>
          <span class="preview-card-points">${card.points} pts</span>
          <button class="edit-btn" onclick="CaseEditor.editCard(${idx})">✏️</button>
        </div>
        <div class="preview-card-title">${Utils.escapeHtml(card.title)}</div>
        <div class="preview-card-question">${Utils.escapeHtml(Utils.truncate(card.question, 100))}</div>
        <div class="preview-card-answer">💡 ${Utils.escapeHtml(Utils.truncate(card.hint, 60))}</div>
      </div>
    `).join('');
  },
  
  /**
   * Edit scenario text (prompt-based)
   */
  editScenario: function() {
    const newTitle = prompt("Edit case title:", CaseEditor.currentTitle);
    if (newTitle) CaseEditor.currentTitle = newTitle;
    
    const newYear = prompt("Edit year:", CaseEditor.currentYear);
    if (newYear) CaseEditor.currentYear = newYear;
    
    const newScenario = prompt("Edit scenario text:", CaseEditor.currentScenario);
    if (newScenario) CaseEditor.currentScenario = newScenario;
    
    this.renderPreviewScenario();
  },
  
  /**
   * Show PDF upload modal (trigger file input)
   */
  showUploadModal: function() {
    document.getElementById('pdf-input').click();
  },
  
  /**
   * Show new blank case template modal
   */
  showTemplateModal: function() {
    document.getElementById('new-case-title').value = '';
    document.getElementById('new-case-year').value = '';
    document.getElementById('new-case-scenario').value = '';
    this.openModal('template-modal');
  },
  
  /**
   * Show/hide progress indicator
   * @param {boolean} show - Show or hide
   */
  showProgress: function(show) {
    const progressDiv = document.getElementById('extraction-progress');
    if (progressDiv) {
      progressDiv.style.display = show ? 'block' : 'none';
    }
  },
  
  /**
   * Update progress bar and text
   * @param {number} percent - Progress percentage (0-100)
   * @param {string} text - Status text
   */
  updateProgress: function(percent, text) {
    const fill = document.getElementById('progress-fill');
    const textEl = document.getElementById('progress-text');
    if (fill) fill.style.width = percent + '%';
    if (textEl) textEl.textContent = text;
  },
  
  /**
   * Open a modal by ID
   * @param {string} modalId - ID of modal element
   */
  openModal: function(modalId) {
    document.getElementById(modalId).classList.add('open');
  },
  
  /**
   * Close a modal by ID
   * @param {string} modalId - ID of modal element
   */
  closeModal: function(modalId) {
    document.getElementById(modalId).classList.remove('open');
  },
  
  /**
   * Switch between game tabs (cards, frameworks, log)
   * @param {string} tab - Tab name ('cards', 'frameworks', 'log')
   */
  switchGameTab: function(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      }
    });
    
    // Show/hide tab content
    document.getElementById('game-tab-cards').style.display = tab === 'cards' ? 'grid' : 'none';
    document.getElementById('game-tab-frameworks').style.display = tab === 'frameworks' ? 'block' : 'none';
    document.getElementById('game-tab-log').style.display = tab === 'log' ? 'block' : 'none';
    
    if (tab === 'log') {
      Game.renderLog();
    }
  },
  
  /**
   * Start game with a case from the library
   * @param {number} caseIndex - Index in CaseLibrary.cases
   */
  startGameWithCase: function(caseIndex) {
    const caseData = CaseLibrary.cases[caseIndex];
    if (!caseData) {
      alert("Please select a case from the library first.");
      return;
    }
    Game.start(caseData);
  }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});
