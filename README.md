# HF Case Studio

**Human Factors Training Platform for Aviation Maintenance**

[![PWA](https://img.shields.io/badge/PWA-Installable-blue)](https://your-site.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Developer](https://img.shields.io/badge/Developer-Ghanshyam%20Acharya-red)](mailto:your-email)

## Overview

HF Case Studio is an interactive, installable web application for human factors training based on real aviation incidents. It supports EASA/NCAR Part 145 training requirements.

### Features

- 📚 **Case Study Library** - Built-in cases (Alaska 261, Challenger) + create your own
- 📄 **PDF Upload** - Upload accident reports to auto-generate case studies
- 🎮 **Interactive Game** - Draw cards, answer questions, earn points
- 👥 **Multi-Participant** - Unlimited players, facilitator scoring
- 📊 **Export Reports** - Download session logs as PDF
- 📱 **PWA Ready** - Install on mobile/desktop, use offline
- 🔄 **Import/Export** - Share case studies as JSON files

## Quick Start

### Online (GitHub Pages)
Visit: `https://yourusername.github.io/hf-case-game/`

### Local Development
```bash
git clone https://github.com/yourusername/hf-case-game.git
cd hf-case-game
python3 -m http.server 8000
# Open http://localhost:8000

File Structure

hf-case-game/
├── index.html          # Main entry point
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (offline)
├── css/styles.css     # Styling
├── js/                # JavaScript modules
│   ├── app.js         # Main controller
│   ├── utils.js       # Utilities
│   ├── case-library.js
│   ├── pdf-processor.js
│   └── game-engine.js
├── cases/             # Case study JSON files
└── assets/            # Icons & screenshots


Creating Custom Cases
Upload PDF - Drop an accident report

Auto-generate - Questions are created automatically

Edit - Modify questions, hints, model answers

Save - Add to your library

Export - Share as JSON with other facilitators

PWA Installation
Desktop: Click the install icon in address bar

Mobile: "Add to Home Screen" from browser menu

Offline: Works without internet after first load

Technologies
HTML5 / CSS3 / JavaScript (Vanilla)

PDF.js for document parsing

jsPDF for report generation

Service Workers for offline support

LocalStorage for case library

License
MIT License - Free for educational and commercial use

Developer
Ghanshyam Acharya, 2026

Built for human factors training excellence.
