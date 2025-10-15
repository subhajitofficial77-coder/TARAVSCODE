# TARA REPLIT DASHBOARD - FRAME Blueprint

## 🎯 FRAME Overview
**F**unction, **R**esearch, **A**rchitecture, **M**ood, **E**xecution

This blueprint provides a comprehensive guide for the TARA Replit Dashboard project, designed for both vibe coding tools and user understanding.

## 📋 Project Summary
TARA (The Sentient AI Creative Platform) is a production-ready AI-driven creative platform built around a TALE emotional simulation engine, creative content generation, realtime dashboards, and interactive 3D experiences.

## 🏗️ Architecture Overview

### Core Structure
```
REPLIT_DASHBOARD/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── n8n/          # N8N integration endpoints
│   │   ├── studio/       # Creative studio endpoints
│   │   ├── chat/         # Chat functionality
│   │   ├── feedback/     # User feedback handling
│   │   ├── generate-content/ # Content generation
│   │   └── debug/        # Debug endpoints
│   ├── dashboard/        # Main dashboard pages
│   ├── creative-studio/  # Creative studio interface
│   ├── conversation/     # Chat interface
│   └── about/           # About page
├── components/          # React components
│   ├── hero/           # 3D hero experience
│   ├── dashboard/      # Dashboard components
│   ├── content/        # Content generation UI
│   ├── studio/         # Creative studio UI
│   ├── ui/            # Reusable UI components
│   └── providers/     # Context providers
├── lib/               # Business logic and utilities
│   ├── n8n/          # N8N integration
│   ├── supabase/     # Database and auth
│   ├── tale-engine/  # Emotional simulation
│   ├── hooks/        # Custom hooks
│   └── utils/        # Utility functions
├── public/           # Static assets
└── scripts/          # Development scripts
```

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS-in-JS
- **3D**: React Three Fiber, Three.js, GSAP
- **State Management**: React Context, Zustand
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenRouter, Google AI
- **Real-time**: Supabase Realtime, WebSockets

## 🎨 User Journey & Workflow

### 1. Initial Landing (app/page.tsx)
**First Impression**: 3D interactive hero scene with TARA introduction
- Animated 3D text "TARA" with particle effects
- Starfield background with parallax scrolling
- Data orb visualization showing emotional state
- Call-to-action buttons for dashboard and studio

### 2. Dashboard Experience (app/dashboard/page.tsx)
**Core Interface**: Real-time emotional dashboard
- Emotional radar chart showing current state
- Content carousel with generated creations
- Daily plan panel with AI suggestions
- Relationship graph visualization
- Chat interface for user interaction

### 3. Creative Studio (app/creative-studio/page.tsx)
**Creation Hub**: AI-powered content generation
- Content generation panel with multi-modal inputs
- Memory stream for past creations
- Inspiration hub with trending content
- Advanced carousel for content browsing

### 4. Conversation Interface (app/conversation/page.tsx)
**Chat Experience**: Natural language interaction
- Real-time chat with emotional context
- Feedback collection and processing
- Content sharing and collaboration

## 🔧 Function Breakdown

### Core Functions
1. **Emotional Simulation Engine**
   - TALE engine for emotional state management
   - Daily awakening and relationship decay
   - Emotional impact calculation from user feedback

2. **Content Generation**
   - Multi-modal content creation (text, image, video)
   - Emotional context integration
   - N8N workflow automation

3. **User Interaction**
   - Real-time chat with emotional awareness
   - Feedback loop for emotional adjustment
   - Memory storage and retrieval

4. **Dashboard Visualization**
   - Real-time emotional state display
   - Content carousel with emotional chips
   - Relationship network visualization

### API Endpoints
- `POST /api/generate-content` - Create new content with emotional context
- `POST /api/feedback` - Submit user feedback and update emotional state
- `GET /api/chat/history` - Retrieve chat history
- `POST /api/studio/tara-context` - Get current emotional context
- `POST /api/n8n/webhook` - N8N integration webhook
- `POST /api/simulation/proposal` - Generate simulation proposals

## 🎭 Mood & Experience

### Visual Design Language
- **Color Palette**: Dark theme with vibrant accent colors
- **Typography**: Inter font family for readability
- **Animations**: Smooth transitions and micro-interactions
- **3D Elements**: Interactive 3D scenes with physics

### Emotional Tone
- **Welcoming**: Friendly AI assistant persona
- **Creative**: Inspiring and imaginative
- **Responsive**: Real-time emotional adaptation
- **Professional**: Clean, modern interface

### User Experience Principles
1. **Immediate Engagement**: 3D hero scene on first load
2. **Emotional Connection**: Real-time emotional state visualization
3. **Creative Flow**: Seamless content creation workflow
4. **Personalization**: Adaptive interface based on user interactions

## 🚀 Execution Plan

### Phase 1: Core Infrastructure
- [ ] Set up Next.js project structure
- [ ] Configure Supabase database and authentication
- [ ] Implement basic routing and layout
- [ ] Create core component library

### Phase 2: Emotional Engine
- [ ] Implement TALE emotional simulation
- [ ] Create emotional state management
- [ ] Set up daily awakening system
- [ ] Implement relationship decay

### Phase 3: Content Generation
- [ ] Integrate OpenRouter and Google AI
- [ ] Create content generation API
- [ ] Implement N8N workflows
- [ ] Build content storage and retrieval

### Phase 4: User Interface
- [ ] Develop 3D hero scene
- [ ] Create dashboard components
- [ ] Build chat interface
- [ ] Implement content carousel

### Phase 5: Integration & Polish
- [ ] Connect all systems
- [ ] Add real-time updates
- [ ] Implement feedback loops
- [ ] Performance optimization

## 🔄 Key Workflows

### Content Creation Workflow
1. User initiates content generation
2. System captures current emotional context
3. AI generates content with emotional awareness
4. Content is saved with emotional metadata
5. User can provide feedback on content
6. Emotional state updates based on feedback

### Daily Routine Workflow
1. Daily awakening triggers emotional updates
2. System calculates relationship changes
3. New daily plan is generated
4. User is notified of emotional state
5. Content suggestions are provided

### Feedback Processing Workflow
1. User submits feedback
2. System calculates emotional impact
3. Emotional state is updated in real-time
4. Dashboard reflects new emotional state
5. Future content adapts to new emotional context

## 🛠️ Development Tools & Scripts

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

## 📚 Documentation & Resources

### Key Documentation Files
- `README.md` - Project overview and getting started
- `DEPLOYMENT_AND_TESTING.md` - Detailed deployment guide
- `QUICKSTART.md` - Minimal setup instructions
- `CRITICAL_BUG_FIX.md` - Important bug fixes and patches

### API Documentation
- `lib/n8n/workflows.ts` - N8N integration workflows
- `lib/supabase/queries.ts` - Database query functions
- `lib/tale-engine.ts` - Emotional simulation logic

## 🎯 Success Metrics

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
- Real-time emotional state tracking
- User interaction analytics
- Content generation metrics
- Performance monitoring

### Feedback Loops
- User feedback integration
- Emotional state adaptation
- Content quality assessment
- Feature usage analytics

## 📞 Support & Maintenance

### Common Issues
- **3D Scene Issues**: Check WebGL support and asset loading
- **API Errors**: Verify environment variables and keys
- **Performance**: Monitor bundle size and render times
- **Database**: Check Supabase connection and permissions

### Maintenance Tasks
- Regular dependency updates
- Performance optimization
- Security vulnerability scanning
- User feedback analysis

---

*This blueprint provides a comprehensive guide for developing and maintaining the TARA Replit Dashboard. Use this as a reference for both technical implementation and user experience design.*
