---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflowStatus: complete
completedAt: '2026-01-29'
inputDocuments:
  - planning-artifacts/product-brief-safar-project-2026-01-29.md
  - reference/initial-prd.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  projectDocs: 0
classification:
  projectType: mobile_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - safar-project

**Author:** uzunware
**Date:** 2026-01-29

---

## Executive Summary

### Vision

Safar enables non-Arabic speaking Muslims to understand what they recite in daily prayers. The app transforms 1.8 billion Muslims who pray without comprehension into worshippers who understand their conversation with Allah.

### Core Differentiator

**Root-Word Learning System:** While competitors teach isolated vocabulary, Safar teaches how Arabic actually works — the 3-letter root system that connects word families. Learning ر-ح-م (mercy) unlocks رَحْمَة, رَحِيم, and رَحْمَن simultaneously.

*"Other apps teach words. Safar teaches how Arabic works."*

### Target User

**Fatima** — 32, London, born Muslim, prays 5x daily but doesn't understand Arabic. She's tried language apps before but abandoned them (too much grammar, irrelevant vocabulary). She wants to understand her prayers, not become fluent in MSA.

### The Promise

In 6 weeks, Fatima will understand what she says in her daily prayers — not because she memorized translations, but because she learned the roots.

### Key Metrics

| Metric | Target |
|--------|--------|
| North Star: Words Mastered | 25/week (SR interval ≥7 days) |
| Activation | 50% complete lesson + root tap + D1 return |
| PMF Signal | D7 retention ≥30% |
| Revenue | 5% trial → paid conversion |

---

## Success Criteria

### User Success

**Primary Success Metric: Words Mastered**

A user succeeds when they can reliably understand Quranic vocabulary they encounter. Operationally:
- Word seen in learning mode
- Correctly identified meaning in 3+ review sessions
- Spaced repetition interval ≥7 days (indicating true retention)

**The "Aha Moment"**

User success is achieved when they experience the root connection revelation:
- Sees a word card with root displayed (e.g., ر-ح-م for رَحْمَة)
- Taps to explore related words from the same root
- Realizes Arabic is a connected system, not isolated vocabulary
- Behavioral signal: Root tap-through rate ≥40% in first 3 sessions

**Ultimate User Win**

Fatima stands in Fajr prayer, recites رَبِّ الْعَالَمِينَ, and *knows* she's saying "Lord of the worlds" — not because she memorized a translation, but because she learned the roots. Her prayer becomes conversation, not recitation.

**User Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Activation Rate | 50% of signups | Lesson complete + root interaction + D1 return |
| Salah Pathway Completion | 30% of activated users | Complete all 6 units (~120 words) |
| Words Mastered per Week | 25 words | SR interval ≥7 days |
| Quiz Accuracy | 75%+ | Correct answers in review sessions |

---

### Business Success

**Revenue Metrics:**

| Timeframe | Metric | Target |
|-----------|--------|--------|
| Month 1 | Free trial signups | 5,000 |
| Month 3 | Monthly Active Users | 25,000 |
| Month 3 | Trial → Paid Conversion | 5% |
| Month 6 | Monthly Recurring Revenue | $50,000 |
| Month 12 | Paid Subscribers | 10,000 |

**Retention Metrics:**

| Metric | Minimum Viable | Target | Stretch |
|--------|----------------|--------|---------|
| Day 1 Retention | 50% | 60% | 70% |
| Day 7 Retention | 30% | 40% | 50% |
| Day 30 Retention | 15% | 25% | 35% |

**PMF Signal:** D7 ≥ 30% with organic users indicates product-market fit.

**Unit Economics:**
- Customer Acquisition Cost (CAC): <$10
- Lifetime Value (LTV): >$50
- LTV:CAC Ratio: >5:1

**Lead Indicator:** Weekly Active Learners with Streak ≥7 (WAL-7) — predicts both impact and conversion.

---

### Technical Success

Technical success is defined by a reliable, performant app that maintains user trust. Specific metrics are detailed in Non-Functional Requirements (NFRs).

**Key Technical Principles:**
- No learning progress lost on app crash or network failure
- Sub-2-second app launch, sub-second lesson loads
- Graceful offline degradation (full offline mode Phase 2)
- Minimal PII collection (email only); payment data handled by RevenueCat

---

### Measurable Outcomes

**MVP Launch Gate (Week 6):**
- [ ] User completes full onboarding in <2 minutes
- [ ] User completes first lesson and sees root connections
- [ ] Spaced repetition schedules reviews correctly
- [ ] Streak increments and displays properly
- [ ] Payment flow works (trial → paywall → subscription)
- [ ] App passes TestFlight/Internal Testing with <5 critical bugs

**Go/No-Go Decision Framework:**

| Condition | Decision |
|-----------|----------|
| D7 ≥ 30% AND Trial → Paid ≥ 3% | Proceed to Phase 2 |
| D7 < 30% | Diagnose retention, iterate core loop |
| Trial → Paid < 3% | Test pricing, paywall timing, value communication |

---

## Product Scope

### MVP - Minimum Viable Product

**Timeline:** 6 weeks

**The MVP Promise:** Fatima can understand what she says in her daily prayers.

**Included:**
- Account creation (email + Apple + Google)
- Script gate question ("Can you read Arabic?")
- Salah First pathway only (~120 words, 6 units)
- Word cards with inline root display and tap-to-preview
- Multiple choice quiz (single quiz type)
- SM-2 spaced repetition with 4-button rating
- Streak counter with 1 free freeze per week
- XP points (flat rewards, no levels)
- Progress display (words learned + pathway %)
- 7-day free trial → paywall
- RevenueCat subscription ($4.99/mo, $34.99/yr)
- Basic settings (profile, notifications, sound, subscription)

**Scope Protection:** "Is it required for Fatima to have her aha moment and understand her prayers?" If no, it waits.

---

### Post-MVP Phases

Detailed phasing is documented in Project Scoping & Phased Development section. Summary:

- **Phase 2 (Weeks 7-12):** Additional pathways, Root Explorer, offline mode, transliteration
- **Phase 3 (Weeks 13-20):** Grammar lessons, social features, AI pronunciation
- **Phase 4+ (6-12 months):** Web app, B2B licensing, community features

**2-Year Vision:** Safar becomes the default answer to "I want to understand Quran — where do I start?"

---

## User Journeys

### Journey 1: Fatima's Transformation (Primary User - Success Path)

**Opening Scene:** Fatima, 32, stands in her London flat at Fajr. She's been Muslim her whole life, prays five times daily, but the Arabic words feel hollow — sounds without meaning. She's tried three different apps, each promising "Learn Arabic!" Each abandoned within two weeks. Too much grammar. Too many words she'll never use. Tonight she discovered Safar through a TikTok of someone crying while explaining they finally understood Al-Fatiha.

**Rising Action:**
- Downloads app, creates account with Apple Sign-In (30 seconds)
- "Can you read Arabic script?" — Yes, she can recite, just doesn't understand
- Sees "Salah First" pathway: "Understand your daily prayers in 6 weeks"
- First lesson: الْحَمْدُ (al-hamd) — she's said this 50,000+ times
- Taps the root display: ح-م-د appears. Sees حَمِيد (Hameed - praiseworthy) is connected
- *Aha moment:* "Wait... these aren't random words. They're all connected."

**Climax:** End of Week 1. Fatima opens the app for her daily lesson. 15 words learned. She goes to Dhuhr prayer, recites الْحَمْدُ لِلَّهِ, and for the first time *knows* she's praising Allah. Tears. This is different.

**Resolution:** Week 6. Fatima completes the Salah pathway. 120 words mastered. She stands in prayer and follows the meaning as she recites. She messages three friends: "You have to try this app." Her prayer is no longer recitation — it's conversation.

---

### Journey 2: James's Catch-Up (Secondary User - Revert)

**Opening Scene:** James, 28, Denver, accepted Islam 8 months ago. He can barely read Arabic script — learned the sounds phonetically from YouTube. He wants to understand what he's saying but feels behind everyone at the masjid. He's embarrassed to ask for help.

**Rising Action:**
- Downloads Safar, creates account
- "Can you read Arabic script?" — Hesitates... taps "I'm still learning"
- Sees script-learning resources (Phase 2 feature, not MVP — he can proceed but is guided to supplement)
- Starts Salah First pathway with transliteration support ON
- First word: sees الْحَمْدُ with "al-hamdu" underneath
- Learns meaning while reinforcing script recognition

**Climax:** Week 3. James is at Jumu'ah. The imam recites a verse with رَحِيم — James recognizes it. "That's from the root for mercy!" He feels like he belongs.

**Resolution:** Week 8. James can read basic Arabic script and understands his salah vocabulary. He turns off transliteration. He's not behind anymore — he's catching up.

---

### Journey 3: Streak Break Recovery (Edge Case)

**Opening Scene:** Fatima has a 23-day streak. She's invested. Then: sick child, work crisis, three days without opening the app.

**Rising Action:**
- Day 1 missed: Push notification at her usual time. Ignored.
- Day 2: "Your streak is at risk!" She sees it, feels guilty, but can't.
- Day 3: Streak breaks. 23 → 0. She feels defeated.
- Day 4: Opens app expecting shame. Instead: "Welcome back! Your knowledge is still here. 47 words ready for review."

**Climax:** No punishment. No "start over." Her spaced repetition data is intact. She does a quick review session — 5 minutes. Remembers most words.

**Resolution:** New streak begins. By day 30 of her new streak, she's at 85 words. The break didn't erase her progress — just paused it. She tells a friend: "This app doesn't make you feel bad for being human."

---

### Journey 4: Founder Operations (Admin/Ops)

**Opening Scene:** The founder checks dashboards Monday morning. What happened over the weekend?

**Rising Action:**
- Opens Mixpanel: 2,400 DAU, up 15% from last week
- Checks RevenueCat: 12 new subscribers, 3 cancellations
- Reviews Sentry: 2 crash reports, both on Android 11 + specific device
- Looks at funnel: Onboarding completion dropped 5%... investigates
- Finds: Users dropping at script gate question — copy might be confusing

**Climax:** Identifies the issue, writes copy variation for A/B test, deploys via remote config (no app update needed).

**Resolution:** Next week: Onboarding completion back up. Crisis averted through visibility and rapid iteration.

---

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---------|----------------------|
| Fatima (Success) | Onboarding, pathway structure, word cards, root display, spaced repetition, progress tracking |
| James (Revert) | Script assessment, transliteration toggle, accessible entry point |
| Streak Recovery | Streak freezes, graceful re-engagement, progress persistence, gentle notifications |
| Founder Ops | Analytics dashboard, crash monitoring, subscription metrics, remote config |

---

## Domain-Specific Requirements

### EdTech Context

Safar operates in the edtech domain but serves religious adult education, which has different compliance requirements than K-12 or academic platforms.

### Privacy & Data Protection

**GDPR Compliance (UK/EU Users):**
- Clear privacy policy explaining data collection and usage
- Explicit consent for analytics tracking (Mixpanel)
- Right to data export and deletion upon request
- Email stored in Supabase; learning progress data is user-owned
- No data selling or third-party advertising

**Minimal PII Collection:**
- Email address only (no name, age, location required)
- Learning progress data (words learned, streaks, quiz results)
- Device analytics for crash reporting (anonymized)

### Content Integrity

**Quranic Text Accuracy:**
- Arabic text sourced from verified Uthmani script editions
- No user-generated content for vocabulary (curated database)
- Root word etymologies verified against classical lexicons (Lane's Lexicon, Hans Wehr)

**Audio Authenticity:**
- Recitation audio from recognized Qaris (reciters)
- Clear attribution for audio sources
- No AI-generated recitation in MVP

### Accessibility

**WCAG 2.1 Level AA Target:**
- Sufficient color contrast for Arabic text
- Support for system font size scaling
- VoiceOver/TalkBack compatibility for navigation
- Audio descriptions not required (visual learning app with audio supplements)

### Religious Sensitivity

**Content Review:**
- All translations reviewed for accuracy and respect
- No sectarian bias in word meanings
- Translations reflect mainstream scholarly consensus

---

## Innovation & Novel Patterns

### Detected Innovation: Pedagogical Methodology

Safar's innovation is **not technical** — the tech stack is conventional (React Native, Supabase, RevenueCat). The innovation is **pedagogical**: applying classical Arabic linguistic principles to consumer mobile learning.

### The Root-Word System

**What makes it novel:**
- Traditional Arabic learning apps teach vocabulary as isolated words
- Safar teaches the 3-letter root system — the actual structure of the Arabic language
- Example: Learning ر-ح-م (r-ḥ-m = mercy) unlocks رَحْمَة (mercy), رَحِيم (merciful), رَحْمَن (most merciful)
- Users learn *how Arabic works*, not just what words mean

**Why this hasn't been done:**
- Classical Arabic pedagogy requires years of study to understand roots
- Simplifying it for mobile without losing accuracy is hard
- Most apps optimize for "quick wins" (isolated words) over deep understanding

### Competitive Landscape

| Competitor | Approach | Limitation |
|------------|----------|------------|
| Duolingo Arabic | Gamified vocabulary, full MSA | No Quranic focus, no root system |
| Quran.com | Read/listen, translations | No active learning, no spaced repetition |
| Bayyinah TV | Video courses, deep grammar | High commitment, passive consumption |
| Quranic Arabic apps | Isolated vocabulary lists | No root connections, no SRS |

**Safar's Position:** The first app that teaches Quranic Arabic through the root system with modern spaced repetition.

### Validation Approach

**The root system hypothesis can fail if:**
- Users don't understand root connections (too abstract)
- Root exploration feels like extra work, not insight
- The "aha moment" doesn't translate to retention

**Validation signals:**
- Root tap-through rate ≥40% in first 3 sessions
- Users who explore roots have higher D7 retention than those who don't
- Qualitative feedback mentions "understanding the system" or "words are connected"

### Risk Mitigation

**If root system doesn't resonate:**
- Fallback: Standard vocabulary app with Quranic focus (still differentiated by pathway curation)
- Roots become optional "deep dive" rather than core experience
- Pivot signal: Root tap-through <20% AND no retention correlation

---

## Mobile App Specific Requirements

### Project-Type Overview

Safar is a **cross-platform mobile application** built with React Native (Expo) targeting iOS and Android. The primary interaction is daily micro-learning sessions (5-10 minutes) with vocabulary cards and quizzes.

### Platform Requirements

**Target Platforms:**
- iOS 14.0+ (iPhone and iPad)
- Android 8.0+ (API level 26)

**Framework:** React Native with Expo managed workflow
- Enables rapid iteration and OTA updates
- Single codebase for both platforms
- Access to native features via Expo modules

**Minimum Device Specs:**
- 2GB RAM
- 100MB free storage (app + cached content)
- Network connectivity for initial setup and sync

### Device Permissions

| Permission | Purpose | Required |
|------------|---------|----------|
| Internet | API calls, content sync | Yes |
| Push Notifications | Streak reminders, review prompts | Requested |
| Audio | Quranic recitation playback | Auto-granted |
| Haptics | Feedback on correct/incorrect answers | Auto-granted |
| Storage | Cache audio files, offline data | Auto-granted |

**Permission Request Strategy:**
- Request push notifications after first lesson completion (not on first launch)
- Explain value: "Get reminders to keep your streak alive"
- App functional without push permissions (fallback: in-app badges)

### Offline Mode

**MVP (Graceful Degradation):**
- App launches without network (shows cached content)
- Learning progress queued locally, synced when online
- Clear indicator when offline: "Your progress will sync when connected"
- Core learning loop works with cached vocabulary data

**Phase 2 (Full Offline):**
- Download entire pathway for offline use
- Pre-cache audio files for current + next unit
- Background sync when connectivity restored
- Conflict resolution: last-write-wins for progress data

### Push Notification Strategy

**Notification Types:**

| Type | Trigger | Content | Timing |
|------|---------|---------|--------|
| Streak Reminder | No session today | "Don't lose your {N}-day streak!" | User's typical session time |
| Review Due | SR cards due | "{N} words ready for review" | Morning (configurable) |
| Streak at Risk | 23 hours without session | "Your streak ends in 1 hour!" | 1 hour before midnight |
| Welcome Back | 3+ days inactive | "Your words miss you. Quick review?" | Afternoon |

**Best Practices:**
- Respect user preferences (notification settings in app)
- Max 1 notification per day (no spam)
- Deep link to relevant screen (review queue, continue lesson)
- Personalize with streak count and progress

### App Store Compliance

**Apple App Store:**
- Subscription via StoreKit 2 (RevenueCat handles)
- Required disclosures: auto-renewal terms, privacy policy link
- No external payment links (App Store rules)
- Age rating: 4+ (educational, no objectionable content)
- Privacy nutrition labels: Analytics, App Functionality

**Google Play:**
- Subscription via Google Play Billing (RevenueCat handles)
- Data safety section: Learning progress, email (account)
- Target API level 34 (current requirement)
- Content rating: PEGI 3 / Everyone

**Shared Requirements:**
- Privacy policy URL in app and store listing
- Terms of service URL
- Support contact email
- App review response within 24 hours

### Implementation Considerations

**Build & Deployment:**
- Expo EAS Build for CI/CD
- TestFlight for iOS beta testing
- Google Play Internal Testing track for Android
- OTA updates via Expo Updates for non-native changes

**Performance Targets:**
- Cold start: <2 seconds
- Navigation transitions: <300ms
- Audio playback start: <500ms
- Memory footprint: <150MB active

**Crash Monitoring:**
- Sentry for crash reporting
- Session replay for UX issues
- Performance monitoring for slow screens

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Type:** Experience MVP (not feature MVP)

Safar's MVP is designed to deliver a complete, delightful learning experience for a single pathway — not a feature-incomplete platform. The goal is emotional validation ("I finally understand my prayers") rather than feature breadth.

**Scope Protection Principle:** "Is it required for Fatima to have her aha moment and understand her prayers?" If no, it waits.

**Resource Requirements:**
- Solo developer (full-stack with React Native experience)
- 6-week timeline to MVP
- External: Audio recordings, vocabulary curation (can be done in parallel)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
1. Fatima's Transformation (primary success path)
2. Streak Recovery (edge case)

**Journeys Deferred:**
- James's Revert Journey (transliteration support is Phase 2)
- Founder Operations (basic analytics only; full dashboard is Phase 2)

**Must-Have Capabilities:**

| Capability | Rationale |
|------------|-----------|
| Account creation | Required for progress persistence |
| Script gate question | Routes users appropriately |
| Salah First pathway | The core content (120 words, 6 units) |
| Word cards with root display | The differentiator |
| Multiple choice quiz | Validates learning |
| SM-2 spaced repetition | Ensures retention |
| Streak counter | Primary engagement mechanic |
| 7-day trial + paywall | Revenue path |
| Basic progress display | Motivation and orientation |

**Explicitly Cut from MVP:**

| Feature | Reason | Phase |
|---------|--------|-------|
| Multiple pathways | Reduces scope, sharpens focus | Phase 2 |
| Assessment quiz | Single pathway = everyone starts Lesson 1 | Phase 2 |
| Root Explorer | Inline roots sufficient for aha moment | Phase 2 |
| Levels & badges | XP + streaks + progress sufficient | Phase 2 |
| Offline mode | Graceful degradation sufficient | Phase 2 |
| Transliteration | Prioritize users who can read Arabic | Phase 2 |

### Post-MVP Features

**Phase 2 (Weeks 7-12) - Growth:**
- Frequency-based pathway (500+ common words)
- Surah-based pathways (Juz Amma)
- Root Explorer (dedicated browsing)
- Multiple quiz types (matching, typing)
- Full offline mode
- Transliteration support
- Levels system + badges
- Additional languages

**Phase 3 (Weeks 13-20) - Expansion:**
- Hadith vocabulary module
- Grammar lessons
- AI pronunciation feedback
- Social features (leaderboards, challenges)
- Widget, family plans

**Phase 4+ (6-12 months) - Platform:**
- Web app
- B2B licensing
- Community features

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SM-2 algorithm bugs | Medium | High | Extensive unit tests; manual override for users |
| Audio playback issues | Low | Medium | Use battle-tested Expo AV; cache aggressively |
| Supabase rate limits | Low | High | Batch writes; local queue; monitor usage |

**Market Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Root system doesn't resonate | Medium | Critical | Track tap-through; fallback to standard vocab |
| Users don't retain (D7 <30%) | Medium | High | Iterate on core loop; test notification timing |
| Low trial → paid conversion | Medium | High | Test paywall timing; A/B test pricing |

**Resource Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Solo dev burnout | Medium | High | Strict scope; 6-week hard deadline; cut not cram |
| Audio content delays | Medium | Medium | Curate minimum set first; expand post-MVP |
| Vocabulary accuracy issues | Low | High | Academic review before launch; versioned content |

**Contingency Plan (Reduced Resources):**
If development stalls, the absolute minimum viable launch:
- 3 units instead of 6 (60 words instead of 120)
- No streak freeze (just streak counter)
- No notifications (users return organically)
- This still delivers the "aha moment" for the first Surah

---

## Functional Requirements

### User Management

- FR1: Users can create an account using email and password
- FR2: Users can create an account using Apple Sign-In
- FR3: Users can create an account using Google Sign-In
- FR4: Users can sign in to an existing account
- FR5: Users can sign out of their account
- FR6: Users can reset their password via email
- FR7: Users can delete their account and associated data
- FR8: System persists user identity across app sessions

### Onboarding

- FR9: New users can answer a script assessment question to indicate Arabic reading ability
- FR10: Users can view the available learning pathway (Salah First)
- FR11: Users can begin the learning pathway from the first lesson
- FR12: System tracks onboarding completion status

### Learning Content

- FR13: Users can view lessons organized into units within a pathway
- FR14: Users can access vocabulary words within each lesson
- FR15: Each vocabulary word displays Arabic text, transliteration, and English meaning
- FR16: Each vocabulary word displays its 3-letter Arabic root
- FR17: Users can tap a root to preview other words sharing that root
- FR18: Users can hear audio pronunciation of each vocabulary word
- FR19: System tracks which lessons and units have been completed

### Learning Experience

- FR20: Users can view word cards in a lesson learning mode
- FR21: Users can flip word cards to reveal meaning
- FR22: Users can progress through all words in a lesson
- FR23: Users can complete a multiple-choice quiz after viewing lesson words
- FR24: Quiz questions present Arabic word with multiple English meaning choices
- FR25: System provides immediate feedback on quiz answer correctness
- FR26: Users can rate their recall difficulty after viewing a review card (4-button rating)

### Spaced Repetition & Progress

- FR27: System schedules word reviews using SM-2 spaced repetition algorithm
- FR28: Users can access their review queue of due words
- FR29: System adjusts review intervals based on user difficulty ratings
- FR30: System tracks words across learning states (new, learning, review, mastered)
- FR31: Users can view their total words learned count
- FR32: Users can view their pathway completion percentage
- FR33: Users can view their mastered words count (interval ≥7 days)

### Engagement & Motivation

- FR34: System tracks consecutive daily learning streak
- FR35: Users can view their current streak count
- FR36: Users can use one free streak freeze per week
- FR37: System awards XP points for completing lessons and reviews
- FR38: Users can view their total XP earned
- FR39: System sends push notifications for streak reminders (if permitted)
- FR40: System sends push notifications for due reviews (if permitted)

### Subscription & Monetization

- FR41: New users receive a 7-day free trial period
- FR42: Users can view subscription options (monthly and annual)
- FR43: Users can purchase a subscription via in-app purchase
- FR44: System enforces paywall after trial expiration
- FR45: Users can restore previous purchases
- FR46: Users can view their current subscription status
- FR47: Users can manage their subscription (cancel, change plan)

### Settings & Preferences

- FR48: Users can toggle push notification preferences
- FR49: Users can toggle sound effects
- FR50: Users can access the privacy policy
- FR51: Users can access terms of service
- FR52: Users can contact support

### Data & Privacy

- FR53: System syncs learning progress to cloud when online
- FR54: System queues progress updates locally when offline
- FR55: System syncs queued updates when connectivity restored
- FR56: Users can request export of their personal data
- FR57: Users can request deletion of their personal data

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| NFR1: Cold app launch | <2 seconds | Time from tap to home screen |
| NFR2: Lesson content load | <1 second | Time to display word cards |
| NFR3: Audio playback start | <500ms | Time from tap to sound |
| NFR4: Screen transitions | <300ms | Navigation animation complete |
| NFR5: Quiz answer feedback | <100ms | Immediate visual response |
| NFR6: API response time | <200ms p95 | 95th percentile server response |
| NFR7: Memory footprint | <150MB | Active app memory usage |

### Security

| Requirement | Specification |
|-------------|---------------|
| NFR8: Data in transit | All API calls over HTTPS (TLS 1.2+) |
| NFR9: Authentication tokens | Secure storage (Keychain/Keystore) |
| NFR10: Password requirements | Minimum 8 characters, Supabase default policy |
| NFR11: Session management | Token refresh, secure logout |
| NFR12: Payment handling | No card data stored; RevenueCat PCI compliant |
| NFR13: Crash reports | No PII in crash logs (email redacted) |

### Reliability

| Requirement | Target | Mitigation |
|-------------|--------|------------|
| NFR14: Crash-free sessions | >99.5% | Sentry monitoring, rapid hotfix via OTA |
| NFR15: Data sync reliability | No progress loss | Local queue, retry logic, conflict resolution |
| NFR16: Offline tolerance | Graceful degradation | Cached content, queued writes, clear status |
| NFR17: Backend availability | 99.9% uptime | Supabase managed SLA |

### Scalability

| Requirement | Target | Notes |
|-------------|--------|-------|
| NFR18: Concurrent users | 10,000 DAU | MVP target capacity |
| NFR19: Database growth | 100,000 users | Plan for 12-month scale |
| NFR20: API rate limits | 100 req/min/user | Supabase default, sufficient for app usage |
| NFR21: Asset delivery | CDN for audio | Cloudflare or equivalent for global delivery |

### Accessibility

| Requirement | Standard | Scope |
|-------------|----------|-------|
| NFR22: Color contrast | WCAG 2.1 AA | 4.5:1 for normal text, 3:1 for large |
| NFR23: Touch targets | 44x44pt minimum | All interactive elements |
| NFR24: Font scaling | System font size | Support 100-200% scaling |
| NFR25: Screen readers | VoiceOver/TalkBack | Navigation and content announced |
| NFR26: Motion sensitivity | Respect reduce motion | Disable non-essential animations |

### Integration

| Requirement | Service | Specification |
|-------------|---------|---------------|
| NFR27: Authentication | Supabase Auth | Email, Apple, Google providers |
| NFR28: Database | Supabase PostgreSQL | Real-time subscriptions for sync |
| NFR29: Subscriptions | RevenueCat | iOS/Android purchase handling |
| NFR30: Analytics | Mixpanel | Event tracking, funnels, retention |
| NFR31: Crash reporting | Sentry | Crash capture, session replay |
| NFR32: Push notifications | Expo Notifications | FCM (Android) + APNs (iOS) |

### Data Governance

| Requirement | Specification |
|-------------|---------------|
| NFR33: Data retention | Learning progress retained until account deletion |
| NFR34: Data export | JSON export within 30 days of request |
| NFR35: Data deletion | Complete removal within 30 days of request |
| NFR36: Analytics anonymization | User ID hashed, no email in events |
