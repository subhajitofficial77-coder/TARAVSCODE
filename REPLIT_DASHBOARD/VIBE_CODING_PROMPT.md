# TARA Dashboard - Comprehensive Vibe Coding AI Builder Prompt

## 🎯 Project Overview

Build a complete AI-powered creative dashboard called "TARA" (The Sentient AI Creative Platform) with emotional simulation, 3D interactive elements, and real-time content generation. This is a production-ready Next.js application with advanced emotional AI capabilities.

## 🏗️ Project Structure & Architecture

### Core Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **3D Rendering**: React Three Fiber + Three.js
- **Animation**: GSAP for smooth transitions
- **State Management**: React Context + Custom Hooks
- **Database**: Supabase (already configured in vibe coding environment)
- **AI Integration**: OpenRouter API + Google AI as fallback

### File Structure to Create
```
TARA_DASHBOARD/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── history/route.ts
│   │   ├── daily-plan/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── debug/
│   │   │   ├── plan-candidates/route.ts
│   │   │   ├── simulation-proposals/route.ts
│   │   │   ├── studio-context/route.ts
│   │   │   └── supabase/route.ts
│   │   ├── feedback/route.ts
│   │   ├── generate-content/route.ts
│   │   ├── generated-content/
│   │   │   └── [id]/route.ts
│   │   ├── simulation/
│   │   │   └── proposal/route.ts
│   │   └── studio/
│   │       ├── analyze-social/route.ts
│   │       ├── auto-seed/route.ts
│   │       ├── check-initialization/route.ts
│   │       ├── fetch-memories/route.ts
│   │       ├── generate-image-prompt/route.ts
│   │       ├── generate-multi/route.ts
│   │       ├── masterplan-webhook/route.ts
│   │       ├── persist-narrative/route.ts
│   │       ├── refresh-context/route.ts
│   │       ├── store-memory/route.ts
│   │       ├── tara-context/route.ts
│   │       ├── todays-narrative/route.ts
│   │       └── trigger-awakening/route.ts
│   ├── about/page.tsx
│   ├── conversation/page.tsx
│   ├── creative-studio/page.tsx
│   ├── dashboard/
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── content/
│   │   ├── AdvancedCarousel.tsx
│   │   ├── ContentCarousel.tsx
│   │   ├── ContentEditModal.tsx
│   │   ├── ContentGenerationPanel.tsx
│   │   ├── ContentPreviewCard.tsx
│   │   ├── fixtures/
│   │   │   └── sampleGeneratedContent.ts
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── AnimatedAIChat.tsx
│   │   ├── AnimatedSection.tsx
│   │   ├── BackgroundPaths.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ContentCard.tsx
│   │   ├── ContentFeedbackPanel.tsx
│   │   ├── ContextDebugPanel.tsx
│   │   ├── DailyPlanPanel.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── EmotionalBadge.tsx
│   │   ├── EmotionalGlow.tsx
│   │   ├── EmotionRadarChart.tsx
│   │   ├── LifeEventCard.tsx
│   │   ├── MoodAcceptanceControls.tsx
│   │   ├── RelationshipGraph.tsx
│   │   ├── SentientStatusPanel.tsx
│   │   └── SimulationProposalPanel.tsx
│   ├── errors/
│   │   ├── APIErrorBoundary.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hero/
│   │   ├── DataOrb.tsx
│   │   ├── DottedSurface.tsx
│   │   ├── HeroOverlay.tsx
│   │   ├── HeroScene.tsx
│   │   ├── HeroShell.tsx
│   │   ├── ShaderAnimation.tsx
│   │   ├── Starfield.tsx
│   │   └── TaraText3D.tsx
│   ├── providers/
│   │   ├── Providers.tsx
│   │   └── WebVitalsInitializer.tsx
│   ├── studio/
│   │   ├── AnalyzeCreateHub.tsx
│   │   ├── ContentStreamCard.tsx
│   │   ├── CreationStream.tsx
│   │   ├── DottedSurface.tsx
│   │   ├── InspirationHub.tsx
│   │   ├── RefineModal.tsx
│   │   ├── StudioAmbiance.tsx
│   │   └── TodaysNarrativeHeader.tsx
│   ├── ui/
│   │   ├── FancyButton.tsx
│   │   ├── LiquidButton.tsx
│   │   ├── SkeletonScreen.tsx
│   │   ├── Tabs.tsx
│   │   └── ThemeToggle.tsx
│   └── index.ts
├── lib/
│   ├── accessibility/
│   │   ├── announcer.ts
│   │   ├── focusTrap.ts
│   │   └── keyboardShortcuts.ts
│   ├── api/
│   │   ├── google-ai.ts
│   │   └── weather.ts
│   ├── auth/internal.ts
│   ├── config/ai-models.ts
│   ├── content-handlers.ts
│   ├── contexts/
│   │   ├── index.ts
│   │   ├── TaraStudioContext.tsx
│   │   └── ThemeContext.tsx
│   ├── feedback-loop.ts
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useEmotionalStyling.ts
│   │   ├── useMediaQuery.tsx
│   │   ├── useRealtimeEmotionalState.ts
│   │   └── useScrollProgress.tsx
│   ├── openrouter.ts
│   ├── performance/webVitals.ts
│   ├── prompts/
│   │   ├── content-prompts.ts
│   │   └── genesis-v7.ts
│   ├── simulation/planGenerator.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   ├── queries/initialize.ts
│   │   ├── queries/masterPlan.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── tale-engine.ts
│   ├── utils/
│   │   ├── emotionUtils.ts
│   │   └── index.ts
│   └── utils.ts
├── public/
│   ├── favicon.ico
│   └── fonts/
│       ├── Inter_Bold.json
│       └── README.md
├── scripts/
│   ├── check-env.ps1
│   ├── create-and-seed-db.sql
│   ├── create-daily-plans.sql
│   ├── download-and-convert-inter.js
│   ├── init-db.js
│   ├── install-font-from-path.js
│   ├── Inter-Bold.ttf
│   ├── restore-env-from-input.ps1
│   ├── seed-studio-data.ts
│   ├── test-apis.js
│   ├── test-save-generated-content.js
│   ├── validate-font.js
│   └── verify-deployment-readiness.js
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 20240101000000_fix_uuid_extension.sql
│       ├── 20240101000000_initial_schema.sql
│       ├── 20240101000001_rls_policies.sql
│       ├── 20240102000000_tale_triggers.sql
│       ├── 20241201000000_master_plans_and_studio_context.sql
│       ├── 20250102000000_content_memories.sql
│       └── 20240930000001_add_feedback_received_at.sql
├── types/
│   ├── ai.ts
│   ├── content.ts
│   ├── database.ts
│   ├── emotional.ts
│   ├── feedback.ts
│   ├── studio.ts
│   ├── supabase.ts
│   └── tale.ts
├── utils/
│   ├── cn.ts
│   ├── emotionalColors.ts
│   ├── formatters.ts
│   └── validators.ts
└── package.json
```

## 🎨 Core Features & Functionality

### 1. 3D Interactive Hero Scene (app/page.tsx)
**Primary Landing Experience**
- Create an immersive 3D scene using React Three Fiber
- Animated "TARA" text that responds to mouse movement
- Starfield background with parallax scrolling effects
- Data orb visualization showing emotional state
- Smooth transitions and loading animations
- Call-to-action buttons for Dashboard, Creative Studio, and Conversation

**Key Components to Build:**
- `HeroScene.tsx` - Main 3D scene with camera and controls
- `TaraText3D.tsx` - Animated 3D text with mouse tracking
- `Starfield.tsx` - Particle system background
- `DataOrb.tsx` - Emotional state visualization
- `ShaderAnimation.tsx` - Custom shaders for visual effects

### 2. Emotional Simulation Engine
**TALE (The Artificial Life Engine)**
- Real-time emotional state tracking across multiple dimensions
- Daily awakening system that updates emotional state
- Relationship decay calculations
- Feedback impact processing
- Memory system for past interactions

**Key Files:**
- `lib/tale-engine.ts` - Core emotional simulation logic
- `lib/feedback-loop.ts` - Feedback processing and emotional updates
- `supabase/migrations/` - Database schema for emotional states
- `types/emotional.ts` - Emotional state type definitions

### 3. Main Dashboard (app/dashboard/page.tsx)
**Command Center Interface**
- Real-time emotional radar chart showing current state
- Content carousel with generated creations and emotional tags
- Daily plan panel with AI-generated suggestions
- Relationship graph visualization
- Chat interface for user interaction
- Context debug panel for development

**Key Components:**
- `EmotionRadarChart.tsx` - Visualize emotional state across dimensions
- `ContentCarousel.tsx` - Browse recently generated content
- `ChatInterface.tsx` - Real-time chat with emotional context
- `DailyPlanPanel.tsx` - AI-generated daily suggestions
- `RelationshipGraph.tsx` - Visualize user relationships

### 4. Creative Studio (app/creative-studio/page.tsx)
**Content Creation Hub**
- Multi-modal content generation (text, image, video)
- Memory stream of past creations
- Inspiration hub with trending content
- Advanced content browsing with emotional tags
- Content generation panel with emotional context

**Key Components:**
- `ContentGenerationPanel.tsx` - Create new content with emotional awareness
- `ContentPreviewCard.tsx` - Display content with emotional metadata
- `ContentFeedbackPanel.tsx` - Collect user feedback
- `InspirationHub.tsx` - Discover trending content

### 5. Conversation Interface (app/conversation/page.tsx)
**Natural Language Interaction**
- Real-time chat with emotional context
- Feedback collection and processing
- Content sharing and collaboration
- Emotional state updates based on conversation

## 🤖 API Endpoints to Implement

### Core Content & Chat APIs
```typescript
// Content Generation
POST /api/generate-content - Create new content with emotional context
GET /api/generated-content/[id] - Retrieve specific content
POST /api/feedback - Submit user feedback and update emotional state

// Chat System
GET /api/chat/history - Retrieve chat history
POST /api/chat - Send chat messages

// Emotional Engine
POST /api/studio/tara-context - Get current emotional context
POST /api/studio/todays-narrative - Get daily narrative
POST /api/studio/persist-narrative - Save narrative updates

// Studio Functions
POST /api/studio/store-memory - Save memories
POST /api/studio/fetch-memories - Retrieve memories
POST /api/studio/generate-image-prompt - Create image prompts
POST /api/studio/generate-multi - Multi-modal content generation

// Simulation & Planning
POST /api/simulation/proposal - Generate simulation proposals
GET /api/daily-plan - Get daily plan
GET /api/daily-plan/[id] - Get specific daily plan

// Debug Endpoints
GET /api/debug/supabase - Supabase connection test
GET /api/debug/studio-context - Studio context debug
GET /api/debug/plan-candidates - Plan generation debug
GET /api/debug/simulation-proposals - Simulation debug
```

### AI Integration
- **OpenRouter API** for primary content generation
- **Google AI** as fallback for content generation
- **Emotional Context** integration in all AI prompts
- **Multi-modal** content creation (text, image, video)

## 🎯 User Experience Flow

### 1. First Visit (0-30 seconds)
1. **3D Hero Scene Loads**: Interactive 3D experience with animations
2. **Mouse Interaction**: Scene responds to cursor movement
3. **Navigation Options**: Dashboard, Creative Studio, Conversation buttons appear
4. **Loading Indicators**: Smooth transitions and system initialization

### 2. Dashboard Experience
1. **Emotional State**: Real-time emotional radar chart
2. **Content Browsing**: Carousel with emotional tags
3. **Daily Planning**: AI-generated suggestions
4. **Chat Interface**: Real-time conversation with emotional context
5. **Relationship Visualization**: Network of user connections

### 3. Creative Studio Workflow
1. **Content Creation**: Multi-modal generation with emotional awareness
2. **Memory Access**: Browse past creations and inspirations
3. **Inspiration Hub**: Discover trending and recommended content
4. **Feedback Loop**: Rate content and provide input
5. **Content Evolution**: TARA learns from user preferences

### 4. Conversation Flow
1. **Natural Interaction**: Conversational interface
2. **Emotional Context**: Chat adapts to current emotional state
3. **Content Sharing**: Share and collaborate on creations
4. **Feedback Collection**: Rate content and provide input
5. **Relationship Building**: Conversations build emotional depth

## 🧠 Emotional Engine Details

### Emotional State Management
- **Dimensions**: Track emotions across multiple axes (happiness, creativity, energy, etc.)
- **Real-time Updates**: Emotional state changes with user interaction
- **Memory System**: Past interactions influence future behavior
- **Feedback Processing**: User input shapes TARA's personality
- **Daily Awakening**: Morning emotional state updates
- **Relationship Decay**: Emotional connections evolve over time

### Emotional Visualization
- **Radar Charts**: Visualize emotional state across dimensions
- **Color Coding**: Emotional tags on generated content
- **Data Orb**: Pulsing visualization of current state
- **Emotional Chips**: Show emotional context on content
- **State History**: Track emotional changes over time

## 🎮 3D Scene Implementation

### Technical Requirements
- **React Three Fiber** for 3D rendering
- **Three.js** for WebGL operations
- **GSAP** for smooth animations
- **Drei** helpers for Three.js
- **Performance Optimization** for smooth 60fps
- **Responsive Design** for different screen sizes
- **Mobile Support** for touch interactions

### Scene Components
- **Camera System**: Responsive camera with smooth controls
- **Lighting**: Dynamic lighting with ambient and point lights
- **Materials**: Custom shaders and materials
- **Particles**: Starfield and particle effects
- **Interactions**: Mouse tracking and hover effects
- **Animations**: Smooth transitions and state changes

## 🗄️ Database Schema (Supabase)

### Key Tables
```sql
-- Generated Content
generated_content (
  id UUID PRIMARY KEY,
  title TEXT,
  content JSONB,
  emotional_context JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Emotional States
emotional_states (
  id UUID PRIMARY KEY,
  user_id UUID,
  emotions JSONB,
  timestamp TIMESTAMP
)

-- Relationships
relationships (
  id UUID PRIMARY KEY,
  user1_id UUID,
  user2_id UUID,
  relationship_type TEXT,
  emotional_value DECIMAL,
  last_interaction TIMESTAMP
)

-- Feedback
feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  content_id UUID,
  rating INTEGER,
  feedback_text TEXT,
  emotional_impact JSONB,
  created_at TIMESTAMP
)

-- Daily Plans
daily_plans (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  plan JSONB,
  emotional_context JSONB,
  created_at TIMESTAMP
)
```

## 🎨 Design System

### Visual Design
- **Color Palette**: Dark theme with vibrant accent colors
- **Typography**: Inter font family for readability
- **Animations**: GSAP-powered smooth transitions
- **3D Elements**: Interactive 3D scenes with physics
- **Accessibility**: Keyboard navigation and screen reader support

### Component Design
- **Reusable Components**: Modular, composable UI elements
- **Consistent Styling**: Tailwind CSS with custom utilities
- **Responsive Design**: Works on desktop and mobile
- **Performance**: Optimized for fast loading and smooth interactions

## 🔧 Development Tools & Scripts

### Essential Commands
```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run check-env       # Validate environment setup
npm run test-apis       # Test API connectivity
npm run verify-deployment # Pre-deployment validation
```

### Development Scripts
- `scripts/check-env.ps1` - Environment validation
- `scripts/test-apis.js` - API connectivity testing
- `scripts/verify-deployment-readiness.js` - Pre-deployment checks
- `scripts/init-db.js` - Database initialization
- `scripts/seed-studio-data.ts` - Studio data seeding

## 🚀 Performance Optimization

### Loading Performance
- **Lazy Loading**: Components load as needed
- **Image Optimization**: Assets optimized for quick loading
- **Bundle Splitting**: Code split for faster initial load
- **Caching**: Frequently used data cached for speed

### 3D Performance
- **Level of Detail**: Optimize 3D scene complexity
- **Texture Compression**: Compressed textures for faster loading
- **Animation Optimization**: Efficient animation loops
- **Memory Management**: Proper cleanup of 3D objects

### Runtime Performance
- **Memoization**: Expensive calculations cached
- **Virtualization**: Long lists optimized
- **Debouncing**: Input events debounced for performance
- **State Management**: Efficient state updates

## 🔒 Security & Authentication

### Authentication
- **Supabase Auth** integration
- **Environment Variable** protection
- **API Key** management
- **Rate Limiting** for API endpoints

### Data Security
- **Input Validation** for all user inputs
- **SQL Injection** prevention
- **XSS Protection** for user content
- **CORS Configuration** for API security

## 📱 Mobile Experience

### Touch Interactions
- **Touch-friendly** interface with large tap targets
- **Responsive Design** adapts to screen size
- **Performance** optimized for mobile devices
- **Offline Support** for basic functionality

### Mobile 3D
- **Simplified Scene** for mobile performance
- **Touch Controls** for 3D interaction
- **Gesture Support** for navigation
- **Performance Monitoring** for mobile devices

## 🆘 Error Handling & Debugging

### Error Boundaries
- **API Error** boundaries for graceful failures
- **3D Scene** error handling
- **Fallback UI** for component failures
- **Error Logging** for debugging

### Debug Tools
- **Context Debug** panel for development
- **Console Logging** for troubleshooting
- **Error Reporting** for production issues
- **Performance Monitoring** for optimization

## 📚 Documentation & Comments

### Code Documentation
- **TypeScript** interfaces and types
- **JSDoc** comments for functions
- **Component** prop documentation
- **API** endpoint documentation

### Development Documentation
- **README.md** - Project overview and setup
- **DEPLOYMENT_AND_TESTING.md** - Detailed deployment guide
- **QUICKSTART.md** - Minimal setup instructions
- **CRITICAL_BUG_FIX.md** - Important fixes and patches

## 🎯 Success Criteria

### Technical Metrics
- **Performance**: <3s initial load time
- **Reliability**: 99.9% uptime for core services
- **Scalability**: Support 1000+ concurrent users
- **Security**: OAuth2 authentication, encrypted data

### User Experience Metrics
- **Engagement**: 5+ minutes average session time
- **Retention**: 70% weekly active users
- **Satisfaction**: 4.5+ star user rating
- **Content Creation**: 10+ pieces per user weekly

## 🔄 Continuous Improvement

### Monitoring & Analytics
- **Real-time** emotional state tracking
- **User interaction** analytics
- **Content generation** metrics
- **Performance** monitoring

### Feedback Loops
- **User feedback** integration
- **Emotional state** adaptation
- **Content quality** assessment
- **Feature usage** analytics

## 📞 Support & Maintenance

### Common Issues
- **3D Scene** not loading (WebGL support)
- **API Errors** (environment variables)
- **Performance Issues** (bundle size)
- **Database** connection problems

### Maintenance Tasks
- **Regular updates** for dependencies
- **Performance optimization** monitoring
- **Security vulnerability** scanning
- **User feedback** analysis

## 🎉 Final Notes

This is a production-ready implementation of TARA - The Sentient AI Creative Platform. The application should be fully functional with:

1. **Immersive 3D Experience** on first load
2. **Real-time Emotional Simulation** with TALE engine
3. **Multi-modal Content Generation** with AI integration
4. **Interactive Dashboard** with emotional visualization
5. **Creative Studio** for content creation
6. **Conversation Interface** for natural interaction

The application should feel alive, responsive, and emotionally aware, creating a unique AI companion experience that evolves with user interaction.

**Important**: Since Supabase is already configured in the vibe coding environment, focus on the frontend implementation, API endpoints, and emotional engine logic. The database schema is provided for reference but may need adaptation to the specific Supabase configuration in the vibe coding tool.

**Key Files to Prioritize**:
1. `app/page.tsx` - 3D hero scene
2. `app/dashboard/page.tsx` - Main dashboard
3. `app/creative-studio/page.tsx` - Content creation
4. `lib/tale-engine.ts` - Emotional simulation
5. `components/hero/` - 3D scene components
6. `components/dashboard/` - Dashboard components

Build this as a cohesive, production-ready application with attention to performance, user experience, and emotional AI capabilities.
