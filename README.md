# PRTC Smart Electric Bus Tracker – Pondicherry

A progressive web application (PWA) for tracking PRTC buses in real-time, designed with accessibility and performance in mind.

## Defaults
- **Location**: Pondicherry
- **Languages**: English, Tamil, French (Pondicherry context)
- **Accessibility**: High Contrast Mode, Large Text Mode, Voice Guidance (TTS)

## Features
1. **Live Tracking Simulation**: Predictive tracking interpolation.
2. **Accessibility First**: WCAG 2.1 AA compliant colors and navigation.
3. **PWA Ready**: Mobile-first design.
4. **Community Features**: Report issues, viewing crowd levels.

## How to Run
1. Simply open `index.html` in any modern web browser.
2. For the best experience (and to avoid CORS issues with some potential future features), use a local server:
   - If you have Python: `python -m http.server`
   - If you use VS Code: Use "Live Server" extension.

## Deployment
This is a static web application. It can be deployed immediately to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting provider

## Tech Stack
- **Frontend**: Vue.js 3 (CDN), HTML5, CSS3
- **Map Engine**: Leaflet.js + OpenStreetMap
- **Icons**: Phosphor Icons

## Disclaimer
Data sourced from PRTC public information. Live tracking is community-assisted and predictive until official GPS hardware is installed.
