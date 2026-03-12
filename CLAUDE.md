# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based car database application ("AutoSpec - Smart Car Database") that allows users to search, filter, compare cars, and get AI-powered recommendations using Google's Gemini API. The app features a responsive design with Traditional Chinese language support.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://0.0.0.0:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

The application requires a Gemini API key to enable AI search functionality:
- Set `GEMINI_API_KEY` in `.env.local` at the project root
- The key is exposed via Vite's environment variables (see vite.config.ts:14-15)
- Without the API key, AI search features will gracefully degrade

## Architecture

### Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7 (Hash-based routing)
- **Charting**: Recharts (for comparison radar charts)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API via `@google/genai`

### Application Structure

The app uses a **single-file component architecture** for simplicity:
- Main application logic resides in `App.tsx` (585 lines)
- Page components (HomePage, CarDetailPage, ComparePage) are defined inline within App.tsx
- Shared components are separated into `components/`:
  - `Navbar.tsx` - Navigation with mobile menu and integrated filters
  - `CarCard.tsx` - Reusable car card component
- Services are modular in `services/`:
  - `authService.ts` - Mock Google OAuth login with localStorage persistence
  - `geminiService.ts` - Natural language query interpretation via Gemini API

### Key Features

1. **Search & Filtering**
   - Keyword search (by model or brand)
   - Budget slider (price range in TWD)
   - Brand and car type filters
   - Filter state management via React state

2. **AI-Powered Search**
   - Natural language queries interpreted by Gemini API
   - Converts user intent (e.g., "省油的Toyota SUV，預算100萬內") into structured filters
   - Displays reasoning for recommendations
   - Uses structured JSON output schema for reliable parsing

3. **Car Comparison**
   - Compare up to 4 cars side-by-side
   - Radar chart visualization of normalized specs (horsepower, torque, acceleration, value)
   - Floating comparison bar with persistent state
   - Detailed specification table

4. **Authentication**
   - Mock Google OAuth flow (simulated with 800ms delay)
   - User state persisted in localStorage (`autocdb_user`, `autocdb_jwt`)
   - No real authentication backend

### Data Model

All data types are defined in `types.ts`:
- `Car` - Core car entity with specs, features, pricing
- `CarSpecs` - Technical specifications (engine, performance, dimensions)
- `FilterState` - User filter preferences
- `AIRecommendation` - AI service response structure
- Enums for `Brand` and `CarType`

Mock car data is stored in `constants.ts` (MOCK_CARS array with 8 sample vehicles).

### Routing Structure

- `/` - Home page with search/filter and car grid
- `/car/:id` - Car detail page
- `/compare` - Side-by-side comparison page

### Path Aliases

The project uses `@/` as an alias for the project root (configured in tsconfig.json and vite.config.ts).

## Important Implementation Notes

1. **Mobile-First Design**: The app has distinct mobile and desktop search interfaces. The desktop SearchFilters component is hidden on mobile (App.tsx:35), while Navbar includes mobile-specific filter UI.

2. **State Management**: No external state library is used. All state is managed via React hooks in the main App component and passed down as props.

3. **Image Handling**: Car images use picsum.photos placeholders with seed IDs for consistency.

4. **Currency Formatting**: Prices are in Taiwan Dollars (TWD), formatted using Intl.NumberFormat with 'zh-TW' locale.

5. **Comparison Limit**: Maximum 4 cars can be compared simultaneously (enforced in App.tsx:461-463).

6. **API Key Security**: The current implementation exposes the Gemini API key client-side via Vite env variables. This is noted as inappropriate for production in geminiService.ts:4-6.

## Common Development Patterns

- **Responsive Design**: Uses Tailwind-style utility classes with responsive prefixes (sm:, md:, lg:)
- **Filter Updates**: Always use functional setState to preserve previous state: `setFilters(prev => ({ ...prev, newValue }))`
- **Comparison Logic**: Cars are stored in `compareList` array; toggling checks if car exists before add/remove
- **AI Service Error Handling**: Graceful degradation with user-friendly messages when API calls fail
