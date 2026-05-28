/*
  File: utils.js
  Path: /js/utils.js
  Purpose: Utility functions - HTML escaping, localStorage management, ID generation, flash notifications
  Developer: Ghanshyam Acharya, 2026
  Description: Shared helper functions used across all modules
*/

const Utils = {
  /**
   * Generate a unique ID for cases, players, etc.
   * @returns {string} Unique timestamp-random string
   */
  generateId: function() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 8);
  },
  
  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} str - Input string
   * @returns {string} Escaped string
   */
  escapeHtml: function(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  },
  
  /**
   * Show a floating point notification
   * @param {string} text - Text to display (e.g., "+2")
   * @param {string} color - CSS color value (default: var(--gold))
   */
  showFlash: function(text, color = 'var(--gold)') {
    const div = document.createElement('div');
    div.className = 'points-flash';
    div.textContent = text;
    div.style.color = color;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1000);
  },
  
  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON.stringify'd)
   */
  saveToLocalStorage: function(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or defaultValue
   */
  loadFromLocalStorage: function(key, defaultValue = []) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  },
  
  /**
   * Deep clone an object
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  deepClone: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  
  /**
   * Truncate text to specified length
   * @param {string} str - Input string
   * @param {number} length - Maximum length
   * @returns {string} Truncated string with ellipsis if needed
   */
  truncate: function(str, length = 100) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
};
