/*
  File: game-engine.js
  Path: /js/game-engine.js
  Purpose: Game logic - player management, scoring, card handling, answer logging, PDF export
  Developer: Ghanshyam Acharya, 2026
  Description: Manages the gameplay session including players, scoring, card selection, and answer logging
*/

const Game = {
  players: [],
  currentPlayerId: null,
  answerLog: [],
  activeCase: null,
  cards: [],
  
  /**
   * Start a new game session with a selected case
   * @param {object} caseData - The case study to play
   */
  start: function(caseData) {
    this.activeCase = Utils.deepClone(caseData);
    this.cards = this.activeCase.cards.map(c => ({ ...c, used: false }));
    this.answerLog = [];
    this.players = [{ id: Utils.generateId(), name: 'Participant 1', email: '', score: 0 }];
    this.currentPlayerId = this.players[0].id;
    
    document.getElementById('game-title').innerHTML = Utils.escapeHtml(this.activeCase.title);
    this.updateUI();
    this.renderCards();
    this.renderFrameworks();
    
    UI.showScreen('screen-game');
  },
  
  /**
   * Update UI elements (score bar, player dropdown)
   */
  updateUI: function() {
    this.renderScoreBar();
    this.renderPlayerSelect();
  },
  
  /**
   * Render the score bar with all players
   */
  renderScoreBar: function() {
    const container = document.getElementById('game-score-bar');
    if (!container) return;
    container.innerHTML = this.players.map(p => 
      `<div class="score-chip">${Utils.escapeHtml(p.name)}: ${p.score} pts</div>`
    ).join('');
  },
  
  /**
   * Render the player dropdown selector
   */
  renderPlayerSelect: function() {
    const select = document.getElementById('game-player-select');
    if (!select) return;
    select.innerHTML = this.players.map(p => 
      `<option value="${p.id}" ${this.currentPlayerId === p.id ? 'selected' : ''}>${Utils.escapeHtml(p.name)} (${p.score}pts)</option>`
    ).join('');
    select.onchange = (e) => { this.currentPlayerId = e.target.value; };
  },
  
  /**
   * Get the currently selected player object
   * @returns {object|null} Current player or null
   */
  getCurrentPlayer: function() {
    return this.players.find(p => p.id === this.currentPlayerId);
  },
  
  /**
   * Render all cards in the game grid
   */
  renderCards: function() {
    const container = document.getElementById('game-tab-cards');
    if (!container) return;
    container.innerHTML = this.cards.map((card, idx) => `
      <div class="card-game ${card.used ? 'used' : ''}" onclick="${!card.used ? `Game.openCard(${idx})` : ''}">
        <div class="card-game-category">${Utils.escapeHtml(card.category)}</div>
        <div class="card-game-title">${Utils.escapeHtml(card.title)}</div>
        <div class="card-game-points">${card.points} pts</div>
        <div style="font-size:0.6rem; color:var(--muted); margin-top:0.5rem;">${Utils.truncate(card.question, 60)}</div>
      </div>
    `).join('');
  },
  
  /**
   * Render frameworks reference in game
   */
  renderFrameworks: function() {
    const container = document.getElementById('game-tab-frameworks');
    if (!container) return;
    container.innerHTML = CaseLibrary.frameworks.map(f => `
      <div class="framework-item">
        <div class="framework-name">${Utils.escapeHtml(f.name)}</div>
        <div class="framework-desc">${Utils.escapeHtml(f.desc)}</div>
      </div>
    `).join('');
  },
  
  /**
   * Render the answer log
   */
  renderLog: function() {
    const container = document.getElementById('game-tab-log');
    if (!container) return;
    if (!this.answerLog.length) {
      container.innerHTML = '<p style="color:var(--muted);">No answers recorded yet.</p>';
      return;
    }
    container.innerHTML = this.answerLog.map((entry, i) => `
      <div class="log-entry">
        <div class="log-entry-header" onclick="this.nextElementSibling.classList.toggle('open')">
          <span>${Utils.escapeHtml(entry.player)} · ${Utils.escapeHtml(entry.cardTitle)}</span>
          <span style="color:${entry.awarded > 0 ? 'var(--green)' : 'var(--muted)'}">${entry.awarded}/${entry.possible} pts</span>
        </div>
        <div class="log-entry-body">
          <div><strong>Answer:</strong> ${Utils.escapeHtml(entry.answer)}</div>
          <div style="margin-top:0.5rem;"><strong>Model Answer Guide:</strong><br>${Utils.escapeHtml(entry.modelAnswer)}</div>
        </div>
      </div>
    `).join('');
  },
  
  /**
   * Open a card for answering (prompt-based facilitator scoring)
   * @param {number} cardIdx - Index of card in cards array
   */
  openCard: function(cardIdx) {
    const player = this.getCurrentPlayer();
    if (!player) {
      alert("Please add or select a participant first.");
      return;
    }
    
    const card = this.cards[cardIdx];
    if (card.used) return;
    
    // Prompt for answer
    const answer = prompt(
      `${card.title}\n\n${card.question}\n\nHint: ${card.hint}\n\nEnter your answer below:`
    );
    if (!answer) return;
    
    // Facilitator scoring
    let score = 0;
    let scoreMessage = `Award FULL points (${card.points}) for:\n\n"${Utils.truncate(answer, 100)}"`;
    if (confirm(scoreMessage)) {
      score = card.points;
    } else if (card.points >= 2 && confirm(`Award HALF points (${Math.ceil(card.points / 2)})?`)) {
      score = Math.ceil(card.points / 2);
    } else if (confirm(`Award ZERO points?`)) {
      score = 0;
    } else {
      return; // Cancelled
    }
    
    // Update player score
    player.score += score;
    
    // Log the answer
    this.answerLog.push({
      player: player.name,
      playerEmail: player.email,
      cardTitle: card.title,
      cardCategory: card.category,
      answer: answer,
      awarded: score,
      possible: card.points,
      modelAnswer: card.modelAnswer,
      timestamp: new Date().toISOString()
    });
    
    // Mark card as used
    card.used = true;
    
    // Update UI
    this.renderCards();
    this.renderScoreBar();
    this.renderPlayerSelect();
    
    if (score > 0) {
      Utils.showFlash(`+${score}`);
    }
    
    // Auto-switch to next player (optional)
    const currentIndex = this.players.findIndex(p => p.id === this.currentPlayerId);
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.currentPlayerId = this.players[nextIndex].id;
    this.renderPlayerSelect();
  },
  
  /**
   * Add a new player (opens modal)
   */
  addPlayer: function() {
    document.getElementById('new-player-name').value = '';
    document.getElementById('new-player-email').value = '';
    UI.openModal('addplayer-modal');
  },
  
  /**
   * Add player from modal input
   */
  addPlayerFromModal: function() {
    const name = document.getElementById('new-player-name').value.trim();
    const email = document.getElementById('new-player-email').value.trim();
    
    if (!name) {
      alert("Please enter a name.");
      return;
    }
    
    this.players.push({
      id: Utils.generateId(),
      name: name,
      email: email,
      score: 0
    });
    
    if (!this.currentPlayerId) {
      this.currentPlayerId = this.players[0].id;
    }
    
    UI.closeModal('addplayer-modal');
    this.updateUI();
    this.renderCards();
  },
  
  /**
   * End the session and show results
   */
  endSession: function() {
    const sorted = [...this.players].sort((a, b) => b.score - a.score);
    const podiumHtml = sorted.map((p, i) => `
      <div class="podium-item ${i === 0 ? 'first' : ''}">
        <div class="podium-rank">${i + 1}</div>
        <div class="case-item-title">${Utils.escapeHtml(p.name)}</div>
        <div class="case-item-year">${p.score} points</div>
        ${p.email ? `<div class="case-item-year" style="font-size:0.6rem;">${Utils.escapeHtml(p.email)}</div>` : ''}
      </div>
    `).join('');
    
    document.getElementById('results-podium').innerHTML = podiumHtml;
    UI.showScreen('screen-results');
  },
  
  /**
   * Download game session as PDF report
   */
  downloadPDF: function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    
    // Header
    doc.setFontSize(16);
    doc.text(`HF Case Study Report: ${this.activeCase.title}`, 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
    y += 8;
    doc.text(`Developer: Ghanshyam Acharya, 2026`, 20, y);
    y += 12;
    
    // Players summary
    doc.setFontSize(12);
    doc.text("Participants:", 20, y);
    y += 6;
    doc.setFontSize(10);
    for (let p of this.players) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`• ${p.name}: ${p.score} points`, 25, y);
      y += 6;
    }
    y += 6;
    
    // Answers
    doc.setFontSize(12);
    doc.text("Answer Log:", 20, y);
    y += 6;
    doc.setFontSize(9);
    
    for (let entry of this.answerLog) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${entry.player} - ${entry.cardTitle} (${entry.awarded}/${entry.possible} pts)`, 20, y);
      y += 5;
      
      const answerLines = doc.splitTextToSize(`Answer: ${entry.answer}`, 170);
      doc.text(answerLines, 25, y);
      y += answerLines.length * 4 + 4;
    }
    
    doc.save(`hf-session-${this.activeCase.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  }
};
