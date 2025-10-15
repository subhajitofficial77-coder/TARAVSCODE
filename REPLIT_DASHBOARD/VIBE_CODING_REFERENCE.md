# TARA Dashboard - Vibe Coding Quick Reference

## 🎯 Project Overview
**TARA** - The Sentient AI Creative Platform
- **Type**: Next.js 14 App Router with 3D hero scene
- **Purpose**: AI-powered creative dashboard with emotional simulation
- **Key Feature**: Interactive 3D experience with real-time emotional state visualization

## 🏗️ Core Architecture

### File Structure
```
REPLIT_DASHBOARD/
├── app/           # Pages and routing
├── components/    # React components
├── lib/          # Business logic
├── public/       # Static assets
└── scripts/      # Development tools
```

### Key Pages
- **app/page.tsx** - 3D hero scene landing page
- **app/dashboard/page.tsx** - Main dashboard with emotional state
- **app/creative-studio/page.tsx** - Content creation hub
- **app/conversation/page.tsx** - Chat interface

## 🔧 Essential Commands
```bash
npm install        # Install dependencies
npm run dev       # Start development server
npm run build     # Build for production
npm run check-env # Validate environment
```

## 🎨 Key Components

### Hero Scene (components/hero/)
- **HeroScene.tsx** - Main 3D scene with Three.js
- **TaraText3D.tsx** - Animated "TARA" text
- **Starfield.tsx** - Animated background
- **DataOrb.tsx** - Emotional state visualization

### Dashboard (components/dashboard/)
- **EmotionRadarChart.tsx** - Emotional state display
- **ContentCarousel.tsx** - Browse generated content
- **ChatInterface.tsx** - Real-time chat
- **DailyPlanPanel.tsx** - AI-generated suggestions

### Content Generation (components/content/)
- **ContentGenerationPanel.tsx** - Create new content
- **ContentPreviewCard.tsx** - Display content with emotional tags
- **ContentFeedbackPanel.tsx** - User feedback collection

## 🤖 API Endpoints

### Core APIs
- **POST /api/generate-content** - Create content with emotional context
- **POST /api/feedback** - Submit user feedback
- **GET /api/chat/history** - Retrieve chat history
- **POST /api/studio/tara-context** - Get emotional context

### N8N Integration
- **POST /api/n8n/webhook** - N8N workflow integration
- **POST /api/n8n/trigger-content** - Trigger content generation
- **POST /api/n8n/save-master-plan** - Save master plan data

## 🧠 Emotional Engine

### Key Files
- **lib/tale-engine.ts** - TALE emotional simulation
- **lib/feedback-loop.ts** - Feedback processing
- **lib/supabase/queries.ts** - Database operations
- **supabase/functions/daily-awakening/index.ts** - Daily emotional updates

### Emotional State Management
- Real-time emotional state tracking
- Daily awakening system
- Relationship decay calculations
- Feedback impact processing

## 🎮 3D Scene Setup

### Dependencies
- **React Three Fiber** - 3D rendering
- **Three.js** - WebGL library
- **GSAP** - Animation library
- **Drei** - Three.js helpers

### Scene Components
- Responsive camera and controls
- Interactive text with mouse tracking
- Particle systems and shaders
- Performance-optimized rendering

## 🗄️ Database & State

### Supabase Integration
- **lib/supabase/client.ts** - Client configuration
- **lib/supabase/server.ts** - Server-side operations
- **types/supabase.ts** - Type definitions

### Key Tables
- `generated_content` - AI-generated content
- `emotional_states` - Emotional state history
- `relationships` - User relationships
- `feedback` - User feedback data

## 🎯 User Flow

### Landing Page (app/page.tsx)
1. 3D hero scene loads with animations
2. Navigation buttons appear
3. Users can access dashboard, studio, or conversation

### Dashboard (app/dashboard/page.tsx)
1. Emotional state visualization
2. Content carousel with emotional tags
3. Chat interface with emotional context
4. Daily plan and suggestions

### Creative Studio (app/creative-studio/page.tsx)
1. Content generation panel
2. Memory stream of past creations
3. Inspiration hub
4. Advanced content browsing

## 🚀 Performance Tips

### Optimization
- Lazy loading for 3D components
- Image optimization for faster loading
- Bundle splitting for quicker initial load
- Caching for frequently used data

### Best Practices
- Use memoization for expensive calculations
- Implement virtualization for long lists
- Optimize 3D scene performance
- Monitor bundle size

## 🛠️ Development Tools

### Scripts
- `scripts/check-env.ps1` - Environment validation
- `scripts/test-apis.js` - API connectivity testing
- `scripts/verify-deployment-readiness.js` - Pre-deployment checks

### Testing
- Jest for unit tests
- React Testing Library for component tests
- Manual testing for 3D interactions

## 🎨 Design System

### Colors
- Dark theme with vibrant accents
- Emotional color coding
- Accessibility-compliant contrast

### Typography
- Inter font family
- Responsive text sizing
- Clear hierarchy

## 📱 Mobile Considerations

### Responsive Design
- Touch-friendly interactions
- Mobile-optimized 3D scene
- Performance on mobile devices
- Offline functionality

## 🔒 Security & Auth

### Authentication
- Supabase auth integration
- Environment variable protection
- API key management
- Rate limiting

## 🆘 Troubleshooting

### Common Issues
- 3D scene not loading (WebGL support)
- API errors (environment variables)
- Performance issues (bundle size)
- Database connection (Supabase config)

### Debug Tools
- Browser developer tools
- Supabase dashboard
- Environment validation scripts
- Error boundaries

## 📚 Documentation

### Key Files
- **README.md** - Project overview
- **FRAME_BLUEPRINT.md** - Comprehensive blueprint
- **USER_ONBOARDING.md** - User guide
- **DEPLOYMENT_AND_TESTING.md** - Deployment guide

---

*This quick reference helps vibe coding tools and developers understand the TARA Dashboard structure and key components. Use this as a starting point for exploration and development.*
