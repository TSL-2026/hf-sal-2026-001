/*
  File: case-library.js
  Path: /js/case-library.js
  Purpose: Case study management - storage, loading, saving, importing/exporting JSON, default cases
  Developer: Ghanshyam Acharya, 2026
  Description: Manages the library of case studies (Alaska 261, Challenger, user-created)
*/

// Case Library Management
const CaseLibrary = {
  cases: [],
  currentCase: null,
  editingIndex: -1,
  
  // Default frameworks reference (shared across all cases)
  frameworks: [
    { name: "Dirty Dozen", desc: "12 human factors: Communication, Complacency, Knowledge, Distraction, Teamwork, Fatigue, Resources, Pressure, Assertiveness, Stress, Awareness, Norms." },
    { name: "Swiss Cheese (Reason)", desc: "Accidents occur when holes in multiple defensive layers align simultaneously." },
    { name: "Safety Differently (Dekker)", desc: "Human error is a symptom, not a cause. People act rationally given their local context." },
    { name: "Work-as-Done (Conklin)", desc: "Work-as-imagined ≠ work-as-done. Find gaps before accidents." },
    { name: "Safety-II (Hollnagel)", desc: "Study why work usually succeeds. Accidents emerge from normal variability." },
    { name: "Psychological Safety (Edmondson)", desc: "Teams perform best when members can speak up without fear of blame or punishment." }
  ],
  
  /**
   * Initialize the case library - load from localStorage or create defaults
   */
  init: function() {
    this.cases = Utils.loadFromLocalStorage('hf-case-library', this.getDefaultCases());
    this.renderList();
  },
  
  /**
   * Get default case studies (Alaska 261 and Challenger)
   * @returns {Array} Default cases array
   */
  getDefaultCases: function() {
    return [
      {
        id: "alaska261",
        title: "Alaska Airlines Flight 261",
        year: "2000",
        scenario: "Alaska Airlines Flight 261 crashed into the Pacific Ocean on January 31, 2000, killing all 88 aboard. The cause was failure of the jackscrew assembly in the horizontal stabilizer due to inadequate lubrication. A 1997 inspection had flagged excessive end-play, but the supervisor overrode replacement due to schedule pressure and parts unavailability.",
        cards: [
          { category: "Scenario", title: "The Override", points: 1, question: "Which Dirty Dozen factors explain the supervisor's decision to override the technician's replacement recommendation?", hint: "Schedule pressure and parts availability", modelAnswer: "Pressure (schedule/cost), Lack of Resources (part not in stock), Norms (deferral had become standard practice)." },
          { category: "Dirty Dozen", title: "Complacency", points: 1, question: "How did previous successful lubrications create complacency among maintenance staff?", hint: "Think about how familiarity affects attention", modelAnswer: "Familiarity bred the assumption that nothing would go wrong because nothing had before. Attention degrades on repetitive tasks." },
          { category: "Swiss Cheese", title: "Failed Layers", points: 2, question: "Identify at least three defensive layers that failed in this accident.", hint: "Consider design, regulation, organization, supervision", modelAnswer: "Design (no redundancy), Regulatory (interval approval), Organisational (deferral culture), Supervision (override), Execution (poor lubrication)." },
          { category: "Dekker", title: "Local Rationality", points: 1, question: "Why did the supervisor's override seem reasonable at the time?", hint: "What did they know? What couldn't they see?", modelAnswer: "Schedule pressure, part unavailable, no previous failures from deferral, FAA-approved intervals. The decision was locally rational." },
          { category: "Edmondson", title: "Psychological Safety", points: 1, question: "What systemic factor prevented the technician from escalating further after being overruled?", hint: "Not about individual courage", modelAnswer: "Lack of psychological safety. The technician had learned that speaking up had no effect." },
          { category: "Wildcard", title: "Connect It All", points: 3, question: "Using any three frameworks from today's session, build a single explanation of how this accident happened.", hint: "Combine Dirty Dozen, Swiss Cheese, Dekker, Conklin, Hollnagel, or Edmondson", modelAnswer: "Award 1 point per framework correctly applied with a specific link to the accident." }
        ]
      },
      {
        id: "challenger",
        title: "Space Shuttle Challenger",
        year: "1986",
        scenario: "The Space Shuttle Challenger disintegrated 73 seconds after launch on January 28, 1986, killing all seven crew members. The cause was O-ring failure in cold weather. Engineers at Morton Thiokol recommended against launch due to cold temperatures. NASA management pressured them to reconsider. After a teleconference, Thiokol management reversed their recommendation.",
        cards: [
          { category: "Scenario", title: "The Launch Decision", points: 1, question: "Which Dirty Dozen factors were present in NASA's decision to launch despite engineer concerns?", hint: "Consider pressure, assertiveness, and organizational norms", modelAnswer: "Pressure (schedule/public visibility), Lack of Assertiveness (engineers didn't escalate further), Norms (previous O-ring damage had been normalized)." },
          { category: "Dekker", title: "Local Rationality", points: 1, question: "From NASA management's perspective the night before launch, why was proceeding seem reasonable?", hint: "Previous successes and cost pressures", modelAnswer: "Previous launches with O-ring damage had succeeded; cancellation costs were high (political/economic); engineers had been wrong about risk magnitude before." },
          { category: "Edmondson", title: "Silence", points: 1, question: "Using Edmondson's framework, why didn't engineers successfully prevent the launch?", hint: "Psychological safety", modelAnswer: "Psychological safety was absent. The hierarchy and commercial relationship with NASA created fear of retaliation. Silence was the rational choice." },
          { category: "Swiss Cheese", title: "Holes in the Layers", points: 2, question: "Identify three defensive layers that failed before Challenger launched.", hint: "Technical, organizational, regulatory", modelAnswer: "Design (O-ring sensitivity to temperature), Organizational (normalization of deviance), Communication (engineer concerns filtered through management)." }
        ]
      }
    ];
  },
  
  /**
   * Render the case library list in the sidebar
   */
  renderList: function() {
    const container = document.getElementById('case-list');
    if (!
