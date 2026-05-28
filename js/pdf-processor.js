/*
  File: pdf-processor.js
  Path: /js/pdf-processor.js
  Purpose: PDF upload, text extraction, automatic question generation using keyword matching
  Developer: Ghanshyam Acharya, 2026
  Description: Handles PDF file uploads, extracts text using PDF.js, and auto-generates case questions
*/

const PDFProcessor = {
  /**
   * Handle PDF file upload and start processing
   * @param {File} file - The uploaded PDF file
   */
  processPDF: async function(file) {
    if (!file) return;
    
    UI.showProgress(true);
    UI.updateProgress(10, 'Loading PDF file...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const percent = 10 + Math.floor((i / pdf.numPages) * 60);
        UI.updateProgress(percent, `Processing page ${i} of ${pdf.numPages}...`);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
      }
      
      UI.updateProgress(75, 'Generating case study from text...');
      this.generateCaseFromText(fullText, file.name);
      
    } catch (error) {
      console.error('PDF processing error:', error);
      alert('Error processing PDF. Please check the file format and try again.');
      UI.showProgress(false);
    }
  },
  
  /**
   * Generate case study from extracted text
   * @param {string} text - Extracted PDF text
   * @param {string} filename - Original filename
   */
  generateCaseFromText: function(text, filename) {
    // Extract title (use filename or first line with capital letters)
    let title = filename.replace('.pdf', '').replace(/_/g, ' ');
    if (title.length > 50) title = title.substring(0, 50);
    
    // Extract year
    let year = new Date().getFullYear().toString();
    const yearMatch = text.match(/\b(19[0-9]{2}|20[0-9]{2})\b/);
    if (yearMatch) year = yearMatch[0];
    
    // Generate scenario summary (first ~600 chars of meaningful text)
    let cleanText = text.replace(/\s+/g, ' ').trim();
    let scenario = cleanText.substring(0, 800);
    if (cleanText.length > 800) scenario += "...";
    
    // Generate questions based on text content
    const cards = this.generateQuestionsFromText(text, title);
    
    CaseEditor.currentTitle = title;
    CaseEditor.currentYear = year;
    CaseEditor.currentScenario = scenario;
    CaseEditor.currentCards = cards;
    
    UI.updateProgress(100, 'Complete! Review and edit below.');
    setTimeout(() => {
      UI.showProgress(false);
      UI.showBuilderWithCurrent();
    }, 500);
  },
  
  /**
   * Generate questions based on keyword matching in text
   * @param {string} text - Extracted text
   * @param {string} title - Case title
   * @returns {Array} Array of card objects
   */
  generateQuestionsFromText: function(text, title) {
    const cards = [];
    const lowerText = text.toLowerCase();
    
    // Dirty Dozen detection
    const dirtyKeywords = {
      'Pressure': ['pressure', 'schedule', 'deadline', 'delay', 'late', 'cost', 'budget', 'financial'],
      'Complacency': ['complacent', 'routine', 'always worked', 'never happened', 'familiar', 'assumed'],
      'Lack of Resources': ['not available', 'out of stock', 'shortage', 'missing part', 'no tool', 'insufficient'],
      'Norms': ['normally', 'usual', 'standard practice', 'always done', 'accepted', 'common practice'],
      'Lack of Assertiveness': ['did not speak', 'failed to raise', 'hesitated', 'overruled', 'afraid to say'],
      'Fatigue': ['fatigue', 'tired', 'long hours', 'overtime', 'exhaustion', 'sleep'],
      'Distraction': ['distracted', 'interruption', 'attention', 'busy', 'multitasking']
    };
    
    for (const [factor, keywords] of Object.entries(dirtyKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        cards.push({
          category: "Dirty Dozen",
          title: factor,
          points: 1,
          question: `How does "${factor}" appear in this incident? Describe the specific evidence from the case.`,
          hint: `Look for signs of ${factor.toLowerCase()} in the description above.`,
          modelAnswer: `[Based on document evidence: ${Utils.truncate(text, 150)}]`
        });
      }
    }
    
    // Always add core cards if not already present
    const hasScenario = cards.some(c => c.category === "Scenario");
    if (!hasScenario) {
      cards.unshift({
        category: "Scenario",
        title: "The Incident",
        points: 1,
        question: `Summarize the key events that led to this incident. What happened, when, and what were the immediate causes?`,
        hint: "Focus on the sequence of events and contributing factors.",
        modelAnswer: `[Based on document: ${Utils.truncate(text, 200)}]`
      });
    }
    
    const hasSwiss = cards.some(c => c.title === "Failed Layers" || c.category === "Swiss Cheese");
    if (!hasSwiss) {
      cards.push({
        category: "Swiss Cheese",
        title: "Failed Layers",
        points: 2,
        question: "Identify at least three defensive layers that failed in this incident and the specific hole in each layer.",
        hint: "Consider design, regulation, organization, supervision, and technical execution.",
        modelAnswer: "[Review the document for multiple points of failure at different organizational levels.]"
      });
    }
    
    const hasWildcard = cards.some(c => c.category === "Wildcard");
    if (!hasWildcard) {
      cards.push({
        category: "Wildcard",
        title: "Root Cause Analysis",
        points: 3,
        question: "Using any human factors framework from today's session, explain why this incident occurred and what could prevent recurrence.",
        hint: "Don't stop at the immediate cause. Look at systemic factors.",
        modelAnswer: "[Award points for applying framework concepts with specific evidence from the case.]"
      });
    }
    
    // Add Dekker card if relevant keywords found
    if (lowerText.includes('decision') || lowerText.includes('manager') || lowerText.includes('supervisor')) {
      cards.push({
        category: "Dekker",
        title: "Local Rationality",
        points: 1,
        question: "From the perspective of the decision-makers at the time, why did their actions seem reasonable? What information did they have? What couldn't they see?",
        hint: "Step into their shoes. What pressures and constraints existed?",
        modelAnswer: "[Analyze the local context that made the decision appear rational given available information.]"
      });
    }
    
    // Add Edmondson card if relevant
    if (lowerText.includes('speak') || lowerText.includes('raise') || lowerText.includes('concern') || lowerText.includes('report')) {
      cards.push({
        category: "Edmondson",
        title: "Psychological Safety",
        points: 1,
        question: "What does this incident tell us about psychological safety in the organization? Did people feel able to speak up about concerns?",
        hint: "Look for evidence of reporting culture, fear, or retaliation.",
        modelAnswer: "[Analyze whether the organizational culture encouraged or discouraged speaking up.]"
      });
    }
    
    return cards;
  }
};
