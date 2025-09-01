import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import questions from '../data/questions.json';
import backgroundImage from '../assets/minecraft-sunset.jpg';

interface Player {
  id: string;
  name: string;
  points: number;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface GameState {
  status: 'waiting' | 'question' | 'leaderboard' | 'winner';
  questionIndex: number;
  timeRemaining: number;
  revealPercentage: number;
  currentWinner: Player | null;
  roundWinner: Player | null;
}

const ROUND_DURATION = 25000; // 25 seconds
const LEADERBOARD_DURATION = 10000; // 10 seconds
const REVEAL_INTERVAL = 2500; // 2.5 seconds

export default function QuizGame() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    questionIndex: 0,
    timeRemaining: ROUND_DURATION,
    revealPercentage: 0,
    currentWinner: null,
    roundWinner: null,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const currentQuestion = questions[gameState.questionIndex];

  // Simulate TikTok comments
  const simulateComment = useCallback(() => {
    if (gameState.status !== 'question') return;

    const usernames = ['Player1', 'MinecraftFan', 'BlockBuilder', 'CrafterPro', 'PixelMaster', 'RedstoneKing'];
    const randomAnswers = ['diamond', 'creeper', 'enderman', 'nether', 'obsidian', currentQuestion?.answer];
    
    const newComment: Comment = {
      id: Math.random().toString(36),
      user: usernames[Math.floor(Math.random() * usernames.length)],
      text: randomAnswers[Math.floor(Math.random() * randomAnswers.length)],
      timestamp: Date.now(),
    };

    setComments(prev => [newComment, ...prev.slice(0, 4)]);
    
    // Check if answer is correct
    if (currentQuestion && !gameState.roundWinner) {
      const normalizedAnswer = newComment.text.toLowerCase().trim();
      const correctAnswers = [currentQuestion.answer.toLowerCase(), ...(currentQuestion.aliases?.map(a => a.toLowerCase()) || [])];
      
      if (correctAnswers.includes(normalizedAnswer)) {
        const timeElapsed = ROUND_DURATION - gameState.timeRemaining;
        const points = calculatePoints(timeElapsed);
        
        setPlayers(prev => {
          const existing = prev.find(p => p.id === newComment.user);
          if (existing) {
            return prev.map(p => 
              p.id === newComment.user 
                ? { ...p, points: p.points + points }
                : p
            );
          } else {
            return [...prev, { id: newComment.user, name: newComment.user, points }];
          }
        });

        setGameState(prev => ({ 
          ...prev, 
          roundWinner: { id: newComment.user, name: newComment.user, points } 
        }));

        // Check for overall winner (150 points)
        const updatedPlayer = players.find(p => p.id === newComment.user);
        if (updatedPlayer && updatedPlayer.points + points >= 150) {
          setTimeout(() => {
            setGameState(prev => ({ 
              ...prev, 
              status: 'winner',
              currentWinner: { id: newComment.user, name: newComment.user, points: updatedPlayer.points + points }
            }));
          }, 1000);
        }
      }
    }
  }, [gameState, currentQuestion, players]);

  const calculatePoints = (timeElapsed: number): number => {
    if (timeElapsed <= 5000) return 50;
    if (timeElapsed <= 10000) return 40;
    if (timeElapsed <= 15000) return 30;
    if (timeElapsed <= 20000) return 20;
    if (timeElapsed <= 25000) return 10;
    return 5;
  };

  const startGame = () => {
    setGameState({
      status: 'question',
      questionIndex: 0,
      timeRemaining: ROUND_DURATION,
      revealPercentage: 0,
      currentWinner: null,
      roundWinner: null,
    });
    setPlayers([]);
    setComments([]);
  };

  const stopGame = () => {
    setGameState({
      status: 'waiting',
      questionIndex: 0,
      timeRemaining: ROUND_DURATION,
      revealPercentage: 0,
      currentWinner: null,
      roundWinner: null,
    });
    setPlayers([]);
    setComments([]);
  };

  const nextRound = () => {
    if (gameState.questionIndex >= questions.length - 1) {
      setGameState(prev => ({ ...prev, status: 'waiting' }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      status: 'question',
      questionIndex: prev.questionIndex + 1,
      timeRemaining: ROUND_DURATION,
      revealPercentage: 0,
      roundWinner: null,
    }));
  };

  const revealAnswer = (percentage: number): string => {
    if (!currentQuestion) return '';
    const answer = currentQuestion.answer;
    const revealLength = Math.ceil(answer.length * (percentage / 100));
    return answer.substring(0, revealLength) + '•'.repeat(answer.length - revealLength);
  };

  // Game timer and reveal logic
  useEffect(() => {
    if (gameState.status !== 'question') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimeRemaining = prev.timeRemaining - 100;
        const newRevealPercentage = Math.min(100, ((ROUND_DURATION - newTimeRemaining) / REVEAL_INTERVAL) * 10);

        if (newTimeRemaining <= 0) {
          // Move to leaderboard
          setTimeout(() => {
            setGameState(current => ({ ...current, status: 'leaderboard' }));
            setTimeout(nextRound, LEADERBOARD_DURATION);
          }, 100);
          return { ...prev, timeRemaining: 0, revealPercentage: 100 };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          revealPercentage: newRevealPercentage,
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.status, gameState.questionIndex]);

  // Simulate comments
  useEffect(() => {
    if (gameState.status !== 'question') return;

    const commentInterval = setInterval(simulateComment, 2000 + Math.random() * 3000);
    return () => clearInterval(commentInterval);
  }, [simulateComment, gameState.status]);

  // Check URL for admin mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsAdmin(urlParams.get('admin') === '1');
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (gameState.status === 'waiting' || gameState.status === 'winner') {
          startGame();
        }
      } else if (event.code === 'Escape') {
        event.preventDefault();
        if (gameState.status !== 'waiting') {
          stopGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status]);

  const topPlayers = [...players].sort((a, b) => b.points - a.points).slice(0, 20);

  if (gameState.status === 'winner' && gameState.currentWinner) {
    return (
      <div className="fixed inset-0 gradient-sunset flex items-center justify-center">
        <div className="text-center space-y-8 animate-bounce">
          <div className="text-8xl minecraft-text text-white">
            🎉 WINNER! 🎉
          </div>
          <div className="text-4xl minecraft-text text-yellow-300">
            {gameState.currentWinner.name} won this round!
          </div>
          <div className="text-2xl text-white">
            Final Score: {gameState.currentWinner.points} points
          </div>
          <div className="text-lg text-white/80 mt-4">
            Press <kbd className="px-3 py-1 bg-white/20 rounded minecraft-text">SPACE</kbd> to start new game
          </div>
          {isAdmin && (
            <Button onClick={startGame} className="mt-8 minecraft-block">
              Start New Game
            </Button>
          )}
        </div>
        {/* Confetti animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#ff6b35', '#f7931e', '#ffd23f', '#06ffa5', '#3b82f6'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-sunset text-white relative overflow-hidden">
      {/* Minecraft sky background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-pink-400 to-purple-600"></div>
        {/* Pixelated clouds */}
        <div className="absolute top-20 left-20 w-32 h-16 bg-white opacity-30 minecraft-block"></div>
        <div className="absolute top-32 right-32 w-24 h-12 bg-white opacity-25 minecraft-block"></div>
        <div className="absolute top-40 left-1/2 w-28 h-14 bg-white opacity-20 minecraft-block"></div>
      </div>

      <div className="relative z-10 p-8">
        {gameState.status === 'waiting' && (
          <div className="text-center space-y-8">
            <h1 className="text-6xl minecraft-text mb-8">Minecraft Quiz Live</h1>
            <p className="text-2xl">Ready to test your Minecraft knowledge?</p>
            <div className="space-y-4">
              <div className="text-lg text-white/80">
                Press <kbd className="px-3 py-1 bg-white/20 rounded minecraft-text">SPACE</kbd> to start
              </div>
              {isAdmin && (
                <Button onClick={startGame} size="lg" className="minecraft-block text-2xl px-8 py-4">
                  Start Game
                </Button>
              )}
            </div>
          </div>
        )}

        {gameState.status === 'question' && currentQuestion && (
          <div className="space-y-8">
            {/* Timer and Question */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-8">
                {/* Circular Timer */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      stroke="hsl(var(--minecraft-yellow))" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - gameState.timeRemaining / ROUND_DURATION)}`}
                      className="timer-ring"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl minecraft-text">
                      {Math.ceil(gameState.timeRemaining / 1000)}
                    </span>
                  </div>
                </div>
                
                <div className="text-xl minecraft-text">
                  Question {gameState.questionIndex + 1} / {questions.length}
                </div>
              </div>

              <Card className="p-6 bg-black/30 border-2 border-yellow-400 minecraft-block">
                <h2 className="text-3xl minecraft-text mb-4">{currentQuestion.text}</h2>
                <div className="answer-reveal text-yellow-300 glow-primary">
                  {revealAnswer(gameState.revealPercentage)}
                </div>
              </Card>

              {gameState.roundWinner && (
                <div className="correct-flash p-4 rounded-lg bg-green-500/20 border-2 border-green-400">
                  <div className="text-2xl minecraft-text text-green-300">
                    🎉 Correct! {gameState.roundWinner.name} (+{gameState.roundWinner.points} points)
                  </div>
                </div>
              )}
            </div>

            {/* Comments Feed */}
            <Card className="p-4 bg-black/40 border border-white/20 minecraft-block h-48 overflow-hidden">
              <h3 className="text-lg minecraft-text mb-4">Live Comments</h3>
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-ticker flex items-center space-x-3">
                    <Badge variant="secondary" className="minecraft-text text-xs">
                      {comment.user}
                    </Badge>
                    <span className="text-sm">{comment.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {gameState.status === 'leaderboard' && (
          <div className="text-center space-y-6">
            <h2 className="text-4xl minecraft-text">Leaderboard</h2>
            <Card className="p-6 bg-black/40 border-2 border-yellow-400 minecraft-block max-w-2xl mx-auto">
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div 
                    key={player.id} 
                    className="leaderboard-entry flex items-center justify-between p-3 bg-white/10 rounded"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <Badge className="text-lg minecraft-text">#{index + 1}</Badge>
                      <span className="text-xl minecraft-text">{player.name}</span>
                    </div>
                    <span className="text-2xl minecraft-text text-yellow-300">{player.points}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Keyboard Controls Indicator */}
        {gameState.status !== 'waiting' && gameState.status !== 'winner' && (
          <div className="fixed top-4 right-4 text-sm text-white/60">
            Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd> to stop
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && gameState.status !== 'waiting' && (
          <div className="fixed bottom-4 right-4 space-x-2">
            <Button variant="secondary" onClick={() => setGameState(prev => ({ ...prev, status: 'leaderboard' }))}>
              Skip
            </Button>
            <Button variant="destructive" onClick={stopGame}>
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}