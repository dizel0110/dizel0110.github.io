# 🗺️ Portfolio Roadmap & Future Enhancements

**Project:** dizel0110 Personal Brand Ecosystem  
**Last Updated:** March 2026  
**Status:** MVP Complete → Ready for First Push

---

## ✅ Completed (v1.0)

### Core Features
- [x] Hero section with parallax mouse interaction
- [x] Technical Core: AI Prophet Golden Card + GitHub Pulse
- [x] Expertise Modules (LLM, CV, MLOps) with repo links
- [x] Lifestyle section: LA7 Gym + PlayKite cards
- [x] Investor Gateway with Agentic ROI Calculator
- [x] Contact overlay with Email/LinkedIn/Telegram
- [x] Smooth scrolling (Lenis) + Framer Motion animations
- [x] Mobile-first responsive design
- [x] Film grain texture + glassmorphism aesthetic

### Content
- [x] All text in English (international audience)
- [x] AI Prophet description based on real repo analysis
- [x] Lifestyle cards link to Instagram (@beachmonkeyz) + PlayKite
- [x] Quote connecting LLM work ↔ Wind ↔ Kiting metaphor

---

## 🔄 Pending (User Actions Required)

### Before First Push
- [ ] Initialize git repository
- [ ] Create Python virtual environment (for future backend)
- [ ] Set up GitHub repository
- [ ] Configure GitHub Pages or Vercel deployment

### Content Updates (When Ready)
- [ ] **Cardoo Health Integration** — User has Cardoo health tracker mobile app
  - Check if Cardoo has web API or data export
  - Integrate workout/health stats into LA7 Gym card
  - Alternative: Manual progress updates via JSON file

- [ ] **Instagram Content Activation** — @beachmonkeyz currently inactive
  - User plans to post kiting videos, fitness progress
  - When active: embed Instagram feed or highlight reels
  - Consider: Grid of latest posts with hover previews

- [ ] **PlayKite Kiting Stats** — Real session tracking
  - If user tracks sessions: import from PlayKite school records
  - Display: sessions count, wind conditions, locations
  - Visual: Map of kiting spots with heat markers

---

## 🚀 Future Enhancements (Priority Order)

### Phase 2: Interactive Features (High Priority)
1. **GitHub Activity Widget (Real API)**
   - Replace simulated contribution graph with GitHub API data
   - Show: commits, PRs, repo activity
   - Endpoint: `https://api.github.com/users/dizel0110`

2. **AI Chat Demo (Embedded)**
   - Mini chat interface for AI Prophet demo
   - Requires: Backend API endpoint (FastAPI/Flask)
   - Features: Text-only demo, 3 free queries, then CTA

3. **Live Stats Dashboard**
   - GitHub stars counter (real-time)
   - AI Prophet usage stats (if deployed)
   - Kiting sessions counter (manual or API)

### Phase 3: Content Expansion (Medium Priority)
4. **Projects Showcase Page**
   - Dedicated page for each major project:
     - TENSORTONIC-SOLUTIONS (ML fundamentals)
     - HARDML (advanced ML modules)
     - NEWS-RECOMMENDER (MLOps pipeline)
     - ITMO MedTech (CV + FastAPI)
   - Each with: screenshots, tech stack, live demo link

5. **Blog / Writing Section**
   - Technical articles on LLM fine-tuning
   - Kiting + AI philosophy essays
   - Cross-post from Medium/Dev.to if exists

6. **Video Backgrounds**
   - PlayKite card: subtle video loop of kiting
   - LA7 Gym: workout montage (when content available)
   - Optimize: WebM format, lazy loading

### Phase 4: Advanced (Low Priority / Experimental)
7. **Code Execution Sandbox**
   - Embedded Python runner for AI Prophet demos
   - Use: Pyodide (WebAssembly Python)
   - Security: Sandboxed, read-only access

8. **3D Wind/Flow Visualization**
   - Three.js particle system simulating wind flow
   - Interactive: mouse affects particle direction
   - Metaphor: LLM latent space exploration

9. **Multi-language Support**
   - i18n for Russian/English toggle
   - Store: JSON translation files
   - Default: English (investor audience)

---

## 📊 Analytics & Tracking (To Implement)

- [ ] Google Analytics / Plausible (privacy-focused)
- [ ] GitHub stars webhook → display on site
- [ ] Contact form submissions counter
- [ ] ROI calculator usage analytics

---

## 🎨 Design Tweaks (Backlog)

- [ ] Dark/Light mode toggle (investors prefer light?)
- [ ] Loading skeleton screens for slow connections
- [ ] Print stylesheet for CV/resume version
- [ ] PWA support (installable on mobile)

---

## 🔧 Technical Debt

- [ ] Move hardcoded contact info to config file
- [ ] Add TypeScript strict mode
- [ ] Unit tests for ROI calculator logic
- [ ] E2E tests with Playwright
- [ ] Lighthouse score optimization (currently ~90)

---

## 📝 Notes

### Cardoo Health Tracker
- User mentioned having Cardoo mobile app
- Status: Unknown if web API exists
- Action: Ask user to check app settings for API/export feature
- Fallback: Manual JSON updates for workout data

### Instagram Strategy
- @beachmonkeyz (LA7 Gym) — currently grey/inactive in footer
- User plans to activate with:
  - Kiting videos
  - Fitness progress
  - El Gouna lifestyle
- When active: consider embedding feed

### TENSORTONIC-SOLUTIONS
- External ML training platform (like LeetCode for ML)
- User solves challenging ML problems
- Current status: Not prominently featured
- Option: Add "ML Fundamentals" card or mention in About

---

## 🎯 Next Immediate Actions

1. **Git Init** — User will initialize repository
2. **First Push** — Deploy to dizel0110.github.io
3. **GitHub Actions** — Auto-deploy on push to main
4. **Cardoo Check** — Verify if web integration possible

---

**Maintained by:** AI Assistant  
**Contact:** Update this file when making major changes
