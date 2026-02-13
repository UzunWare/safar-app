# Safar Design System - "Divine Geometry"

> **Reference Document** - Extracted from `prototype/prototype.jsx`  
> All UI implementation MUST match this design system exactly.

---

## 🎨 Color Palette

### Primary Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Deep Emerald** | `#0f2e28` | `--color-emerald-deep` | Primary background, text on light |
| **Midnight** | `#0a1f1b` | `--color-midnight` | Dark backgrounds, modal overlays |
| **Parchment** | `#f4f1ea` | `--color-parchment` | Light backgrounds, cards |
| **Gold** | `#cfaa6b` | `--color-gold` | Accent, highlights, CTAs |
| **Cream Text** | `#e8dcc5` | `--color-cream` | Text on dark backgrounds |

### Extended Palette
```css
--color-emerald-900: #0f2e28;
--color-emerald-800: from-emerald-800 to-emerald-950 (gradients);
--color-blue-900: from-blue-900 to-slate-900 (pathway cards);
--color-white-5: rgba(255, 255, 255, 0.05);
--color-white-10: rgba(255, 255, 255, 0.10);
--color-gold-10: rgba(207, 170, 107, 0.10);
--color-gold-20: rgba(207, 170, 107, 0.20);
--color-gold-30: rgba(207, 170, 107, 0.30);
```

---

## 📝 Typography

### Font Stack
| Family | Purpose | Google Font Link |
|--------|---------|------------------|
| **Amiri** | Arabic text, display | `family=Amiri:ital,wght@0,400;0,700;1,400` |
| **Fraunces** | Headings, titles | `family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600` |
| **Outfit** | UI, body, labels | `family=Outfit:wght@300;400;500;700` |

### Typography Scale
```css
/* Arabic Display */
.arabic-hero: font-amiri text-7xl (سَفَر on splash)
.arabic-large: font-amiri text-5xl (word cards)
.arabic-medium: font-amiri text-4xl (inline words)
.arabic-small: font-amiri text-2xl (roots, related words)

/* Headings - Fraunces */
.heading-xl: font-fraunces text-5xl
.heading-lg: font-fraunces text-4xl
.heading-md: font-fraunces text-3xl
.heading-sm: font-fraunces text-2xl
.heading-xs: font-fraunces text-xl/text-lg

/* Body - Outfit */
.body-lg: font-outfit text-xl font-light
.body-md: font-outfit text-lg
.body-sm: font-outfit text-sm
.body-xs: font-outfit text-xs

/* Labels */
.label-uppercase: font-outfit text-xs uppercase tracking-widest
.label-small: font-outfit text-[10px] uppercase tracking-widest
```

---

## 🏗️ Spacing & Layout

### Spacing Scale (Tailwind)
```
Gap/Padding: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20
Common patterns:
- Page padding: p-6, px-6
- Card padding: p-5, p-6, p-8
- Component gaps: gap-2, gap-3, gap-4, gap-6
- Section spacing: mb-4, mb-6, mb-8, mb-12
```

### Border Radius
```css
--radius-sm: rounded-lg (8px)
--radius-md: rounded-xl (12px)
--radius-lg: rounded-2xl (16px)
--radius-xl: rounded-3xl (24px)
--radius-2xl: rounded-[2rem] (32px)
--radius-full: rounded-full
```

---

## 🧩 Component Patterns

### Cards

#### Pathway Card (Dark)
```jsx
className="rounded-[2rem] p-8 overflow-hidden relative shadow-xl 
           transition-all hover:shadow-2xl hover:-translate-y-1 
           bg-gradient-to-br from-emerald-800 to-emerald-950 text-white"
```

#### Content Card (Light)
```jsx
className="bg-white rounded-3xl p-6 shadow-sm border border-[#0f2e28]/5 
           relative overflow-hidden group hover:shadow-md transition-all"
```

#### Glassmorphism Panel
```jsx
className="bg-[#e8dcc5]/10 backdrop-blur-md rounded-3xl p-8 
           border border-[#cfaa6b]/20"
```

### Buttons

#### Primary CTA
```jsx
className="bg-[#cfaa6b] text-[#0a1f1b] px-10 py-4 rounded-xl 
           font-fraunces font-semibold text-lg 
           hover:scale-105 transition-transform 
           shadow-[0_0_30px_rgba(207,170,107,0.3)]"
```

#### Secondary Button
```jsx
className="bg-[#e8dcc5] text-[#0f2e28] px-10 py-4 rounded-xl 
           font-fraunces font-semibold text-lg 
           hover:scale-105 transition-transform 
           shadow-[0_0_30px_rgba(232,220,197,0.3)]"
```

#### Icon Button (Circle)
```jsx
className="w-12 h-12 rounded-full bg-[#f4f1ea] 
           flex items-center justify-center text-[#0f2e28] 
           hover:bg-[#0f2e28] hover:text-[#cfaa6b] 
           transition-colors shadow-sm"
```

### Navigation Bar
```jsx
className="fixed bottom-8 left-1/2 -translate-x-1/2 
           bg-[#0a1f1b]/95 text-[#e8dcc5] 
           px-8 py-4 rounded-2xl 
           shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-40 
           flex gap-10 items-center 
           border border-[#cfaa6b]/20 backdrop-blur-xl"
```

### Input Fields
```jsx
className="w-full bg-white/5 border border-[#cfaa6b]/20 rounded-xl 
           py-4 pl-12 pr-4 text-[#e8dcc5] 
           placeholder:text-[#e8dcc5]/30 
           focus:outline-none focus:border-[#cfaa6b]/50 
           transition-colors font-outfit"
```

### Toggle Switch
```jsx
// Container
className={`w-12 h-7 rounded-full transition-colors relative 
            ${active ? 'bg-[#0f2e28]' : 'bg-gray-300'}`}
// Knob
className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform 
            ${active ? 'left-6' : 'left-1'}`}
```

---

## ✨ Animations

### Keyframes
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}

@keyframes scroll-text {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### Animation Classes
```css
.animate-fade-in-up: animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
.animate-pulse-slow: animation: pulse-slow 4s infinite ease-in-out;
.animate-scroll-text: animation: scroll-text 30s linear infinite;
.shake-animation: animation: shake 0.4s ease-in-out;
```

### Transition Patterns
```css
/* Standard transitions */
transition-all duration-300
transition-colors
transition-transform duration-500 ease-out
transition-opacity duration-1000

/* Hover effects */
hover:scale-105 active:scale-95
hover:-translate-y-1
hover:shadow-2xl
```

---

## 🖼️ Visual Effects

### Background Patterns

#### Islamic Geometric Pattern
```jsx
<pattern id="islamic-geo" width="100" height="100">
  <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" />
  <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
  <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
</pattern>
```

#### Noise Texture Overlay
```jsx
style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200'...feTurbulence...")`,
  opacity: 0.04,
  mixBlendMode: 'overlay'
}}
```

### Shadows
```css
/* Card shadows */
shadow-sm
shadow-lg
shadow-xl
shadow-2xl

/* Glow effects */
shadow-[0_0_30px_rgba(207,170,107,0.3)]  /* Gold glow */
shadow-[0_0_40px_-10px_rgba(207,170,107,0.4)]
shadow-[0_0_50px_rgba(207,170,107,0.15)]
shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]  /* Dark shadow */

/* Soft blur effects */
blur-3xl (for decorative background elements)
blur-[80px]
backdrop-blur-sm
backdrop-blur-md
backdrop-blur-xl
```

---

## 📱 Screen Patterns

### Light Theme Screens (Parchment)
- Dashboard
- Profile
- Settings Modal
- Word Analysis Panel

```jsx
className="min-h-screen bg-[#f4f1ea] text-[#0f2e28] pb-32"
```

### Dark Theme Screens (Midnight)
- Onboarding/Splash
- Explore (Root Garden)
- Lesson Views
- Frequency Lessons

```jsx
className="min-h-screen bg-[#0a1f1b] text-[#e8dcc5] pb-32"
```

---

## 🏷️ Status Indicators

### Progress Dots
```jsx
// Completed
className="w-4 h-4 rounded-full bg-[#cfaa6b]"
// Active
className="w-4 h-4 rounded-full bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
// Locked
className="w-4 h-4 rounded-full bg-white/20 scale-90"
```

### Badges (Rotated Squares)
```jsx
className={`w-14 h-14 rounded-xl rotate-45 flex items-center justify-center text-2xl shadow-sm
            ${earned ? 'bg-[#0f2e28] text-white border-2 border-[#cfaa6b]' 
                     : 'bg-[#f4f1ea] grayscale opacity-50 border border-[#0f2e28]/10'}`}
```

---

## 📋 Checklist for New Screens

When creating new UI not covered in the prototype:

- [ ] Use color palette exactly as defined (no custom colors)
- [ ] Apply correct typography (Amiri for Arabic, Fraunces for headings, Outfit for UI)
- [ ] Maintain rounded corners consistency (2xl for cards, full for buttons/icons)
- [ ] Include subtle animations (fade-in-up on mount)
- [ ] Add background texture overlay for depth
- [ ] Use gold (#cfaa6b) for accents and interactive highlights
- [ ] Ensure 44x44pt minimum touch targets
- [ ] Apply glassmorphism where appropriate (backdrop-blur + transparency)
- [ ] Include decorative elements (gradients, blur orbs, geometric patterns)
- [ ] Test on both light and dark themed screens

---

## 🔧 NativeWind Configuration

Ensure `tailwind.config.js` includes:

```javascript
theme: {
  extend: {
    colors: {
      'emerald-deep': '#0f2e28',
      'midnight': '#0a1f1b',
      'parchment': '#f4f1ea',
      'gold': '#cfaa6b',
      'cream': '#e8dcc5',
    },
    fontFamily: {
      'amiri': ['Amiri', 'serif'],
      'fraunces': ['Fraunces', 'serif'],
      'outfit': ['Outfit', 'sans-serif'],
    },
    animation: {
      'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      'pulse-slow': 'pulseSlow 4s infinite ease-in-out',
    },
  },
}
```

---

**Document Version:** 1.0  
**Source:** `prototype/prototype.jsx`  
**Last Updated:** 2026-01-30
