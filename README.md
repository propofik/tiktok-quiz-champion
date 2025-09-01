# TikTok Live Minecraft Quiz Game

An interactive Minecraft quiz game designed for TikTok Live streams, perfect for use as an OBS Browser Source. Features real-time gameplay, progressive answer reveals, leaderboards, and winner announcements.

## 🎮 Features

- **Real-time Quiz Gameplay**: 25-second rounds with progressive answer reveals
- **Minecraft Theme**: Beautiful blocky UI with sunset gradient backgrounds
- **Scoring System**: Time-based points (50 points for fastest answers down to 5 points)
- **Live Leaderboard**: Shows top 20 players with animated entries
- **Winner Announcements**: Confetti celebration when someone reaches 150 points
- **OBS Integration**: Optimized for 1920x1080 and 1280x720 streaming layouts
- **Admin Controls**: Skip, reset, and pause functionality with `?admin=1` URL parameter

## 🎯 Game Rules

- **Questions**: 30 Minecraft-themed questions in English (expandable to 1000)
- **Round Duration**: 25 seconds per question
- **Answer Reveal**: Progressive reveal every 2.5 seconds (10% increments)
- **Scoring**: 
  - 0-5 seconds: 50 points
  - 5-10 seconds: 40 points
  - 10-15 seconds: 30 points
  - 15-20 seconds: 20 points
  - 20-25 seconds: 10 points
  - 25+ seconds: 5 points
- **Victory Condition**: First player to reach 150 points wins

## 🚀 Setup for OBS

1. **Add Browser Source in OBS**:
   - Source URL: `http://localhost:3000/` (or your deployed URL)
   - Width: 1920, Height: 1080 (or 1280x720)
   - Custom CSS: Leave empty
   - Refresh browser when scene becomes active: ✓

2. **Admin Controls** (optional):
   - Use `http://localhost:3000/?admin=1` to show control buttons
   - Allows starting, skipping, and resetting games

3. **Audio Setup**:
   - The game includes sound effects for correct answers
   - TTS announcements for winners (browser-dependent)

## 🛠️ Development

This is a React + TypeScript + Tailwind CSS application built with Vite.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Customization

- **Questions**: Edit `src/data/questions.json` to add more questions
- **Styling**: Modify `src/index.css` for design system changes
- **Game Logic**: Update `src/components/QuizGame.tsx` for gameplay modifications

## 🎨 Design System

The game uses a Minecraft-inspired design system with:

- **Colors**: Orange/yellow sunset gradients, pixelated UI elements
- **Typography**: Monospace fonts with text shadows for blocky effect
- **Animations**: Smooth transitions, confetti effects, progressive reveals
- **Responsive**: Adapts to different OBS canvas sizes

## 🔧 Technical Notes

**Current Implementation**: 
- Frontend-only with simulated TikTok comments for demonstration
- Real TikTok Live integration would require backend API setup
- Questions are stored in JSON format for easy expansion
- State management handles game progression and scoring

**For Production TikTok Integration**:
- Implement WebSocket connection to TikTok Live API
- Add comment filtering and spam protection
- Set up real-time comment ingestion
- Add user authentication for TikTok API access

## 📱 Responsive Design

- **1920x1080**: Full HD layout with large text and spacing
- **1280x720**: Compact layout for smaller streams
- **Mobile**: Adapts for testing purposes

## 🎵 Audio Features

- **Sound Effects**: Correct answer chimes and winner fanfare
- **TTS Support**: Web Speech API for winner announcements
- **Fallback**: Visual-only mode for environments without audio support

## 🔒 Admin Features

Access admin controls by adding `?admin=1` to the URL:

- **Start Game**: Begin a new quiz session
- **Skip Question**: Move to next question immediately
- **Reset Game**: Clear all scores and restart
- **Pause/Resume**: Control game flow during stream

---

Perfect for Minecraft streamers who want to engage their TikTok Live audience with interactive quizzes!