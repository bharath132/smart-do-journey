import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Plus, Star, Trophy, Flame, Brain, Share2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: 'work' | 'personal' | 'shopping' | 'other';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  completedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
}

interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastTaskDate: string;
  badges: string[];
}

const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Task['category']>('personal');
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    streak: 0,
    lastTaskDate: '',
    badges: []
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'ongoing' | 'finished'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('gamified-tasks');
    const savedStats = localStorage.getItem('gamified-stats');
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        endDate: task.endDate ? new Date(task.endDate) : undefined,
        startTime: task.startTime ?? undefined,
        endTime: task.endTime ?? undefined,
      }));
      setTasks(parsedTasks);
    }
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  // Save to localStorage whenever tasks or stats change
  useEffect(() => {
    localStorage.setItem('gamified-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('gamified-stats', JSON.stringify(userStats));
  }, [userStats]);

  // XP calculation based on priority
  const getXPForTask = (priority: Task['priority']) => {
    const xpMap = { high: 30, medium: 20, low: 10 };
    return xpMap[priority];
  };

  // Level calculation
  const getRequiredXPForLevel = (level: number) => level * 100;

  // Add task function
  const addTask = (taskText: string) => {
    if (!taskText.trim()) return;

    const newTaskObj: Task = {
      id: crypto.randomUUID(),
      text: taskText.trim(),
      completed: false,
      category: selectedCategory,
      priority: selectedPriority,
      createdAt: new Date(),
      startDate,
      endDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    };

    setTasks(prev => [newTaskObj, ...prev]);
    setNewTask('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("");
    setEndTime("");
    
    toast({
      title: "Task Added! 📝",
      description: `"${taskText}" added to your ${selectedCategory} list`
    });
  };

  // Complete task with gamification
  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const xpGained = getXPForTask(task.priority);
    const currentDate = new Date().toDateString();
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, completed: true, completedAt: new Date() }
        : t
    ));

    setUserStats(prev => {
      const newXP = prev.xp + xpGained;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.level;
      
      // Check streak
      const lastDate = new Date(prev.lastTaskDate);
      const today = new Date(currentDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = prev.streak;
      if (prev.lastTaskDate === currentDate) {
        // Same day, no change
      } else if (prev.lastTaskDate === yesterday.toDateString() || prev.streak === 0) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1; // Reset streak
      }

      // Badge feature removed

      if (leveledUp) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        toast({
          title: "🎉 Level Up!",
          description: `You reached Level ${newLevel}!`
        });
      }

      toast({
        title: "Task Completed! ✅",
        description: `+${xpGained} XP gained!`
      });

      return {
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastTaskDate: currentDate,
        badges: prev.badges
      };
    });
  };

  // Voice input setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewTask(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice input failed",
          description: "Please try again or type your task"
        });
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input"
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "🎤 Listening...",
        description: "Speak your task now"
      });
    }
  };

  // AI Suggestions based on time
  const getAISuggestions = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return [
        "Review your goals for today",
        "Plan your morning routine",
        "Check important emails"
      ];
    } else if (hour < 17) {
      return [
        "Take a 15-minute break",
        "Follow up on pending tasks",
        "Prepare for tomorrow"
      ];
    } else {
      return [
        "Reflect on today's achievements",
        "Plan tomorrow's priorities", 
        "Wind down with a good book"
      ];
    }
  };

  const currentXPProgress = ((userStats.xp % 100) / 100) * 100;
  const allCount = tasks.length;
  const ongoingCount = tasks.filter(t => !t.completed).length;
  const finishedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden animated-gradient">
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti absolute w-2 h-2 bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top bar */}
        <div className="flex justify-end mb-4">
          <ThemeSwitcher />
        </div>

        {/* Header with stats */
        }
        <div className="text-center mb-8 fade-in-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gamified Todo
          </h1>
          <p className="text-muted-foreground">Turn your productivity into an adventure!</p>
        </div>

        {/* User Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-xp-bar" />
                Level {userStats.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={currentXPProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {userStats.xp % 100}/{getRequiredXPForLevel(userStats.level)} XP
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{userStats.xp}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive streak-fire" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{userStats.streak} days</p>
            </CardContent>
          </Card>

          {/* Badges removed */}
        </div>

        {/* Add Task Section */}
        <Card className="mb-8 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What needs to be done?"
                onKeyPress={(e) => e.key === 'Enter' && addTask(newTask)}
                className="flex-1"
              />
              <Button
                onClick={toggleVoiceInput}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={isRecording ? "voice-recording" : ""}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={() => addTask(newTask)} className="px-6">
                Add Task
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
                {([
                  { key: 'work', label: 'Work' },
                  { key: 'personal', label: 'Personal' },
                  { key: 'shopping', label: 'Shopping' },
                  { key: 'other', label: 'Other Option' },
                ] as const).map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key as Task['category'])}
                    className="capitalize"
                  >
                    {label}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-1">
                <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                {(['high', 'medium', 'low'] as const).map(priority => (
                  <Button
                    key={priority}
                    variant={selectedPriority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPriority(priority)}
                    className="capitalize"
                  >
                    {priority} (+{getXPForTask(priority)} XP)
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-muted-foreground">Start:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {startDate ? startDate.toLocaleDateString() : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-32" />
                </div>

                <span className="ml-2 text-sm font-medium text-muted-foreground">End:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {endDate ? endDate.toLocaleDateString() : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="mb-8 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Suggestions
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
              >
                {showAISuggestions ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showAISuggestions && (
            <CardContent>
              <div className="space-y-2">
                {getAISuggestions().map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setNewTask(suggestion)}
                  >
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tasks List - separated by category */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold title-glow">Your Tasks</h2>
              <div className="flex gap-1">
                <Button
                  variant={taskFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskFilter('all')}
                >
                  All ({allCount})
                </Button>
                <Button
                  variant={taskFilter === 'ongoing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskFilter('ongoing')}
                >
                  Ongoing ({ongoingCount})
                </Button>
                <Button
                  variant={taskFilter === 'finished' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskFilter('finished')}
                >
                  Finished ({finishedCount})
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share List
            </Button>
          </div>

          {([
            { key: 'work', label: 'Work' },
            { key: 'personal', label: 'Personal' },
            { key: 'shopping', label: 'Shopping' },
            { key: 'other', label: 'Other Option' },
          ] as const).map(({ key, label }) => {
            const categoryTasks = tasks.filter((t) => t.category === (key as Task['category']))
            const filteredCategoryTasks = categoryTasks.filter((t) =>
              taskFilter === 'all' ? true : taskFilter === 'ongoing' ? !t.completed : t.completed
            )
            const emptyText = taskFilter === 'all'
              ? 'No tasks in this category yet.'
              : taskFilter === 'ongoing'
              ? 'No ongoing tasks in this category.'
              : 'No finished tasks in this category.'
            return (
              <div key={key} className="space-y-3 fade-in-up">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredCategoryTasks.length}
                  </Badge>
                </div>

                {filteredCategoryTasks.length === 0 ? (
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      {emptyText}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredCategoryTasks.map((task) => (
                      <Card
                        key={task.id}
                        className={`bg-card/80 backdrop-blur-sm transition-all duration-300 lift ${
                          task.completed ? 'task-complete-glow' : 'hover:shadow-md'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant={task.completed ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => !task.completed && completeTask(task.id)}
                              className={task.completed ? 'task-complete' : ''}
                              disabled={task.completed}
                            >
                              ✓
                            </Button>

                            <div className="flex-1">
                              <p className="">
                                {task.text}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${{
                                    work: 'bg-category-work/20 text-category-work border-category-work/30',
                                    personal: 'bg-category-personal/20 text-category-personal border-category-personal/30',
                                    shopping: 'bg-category-shopping/20 text-category-shopping border-category-shopping/30',
                                    other: 'bg-category-other/20 text-category-other border-category-other/30',
                                  }[task.category]}`}
                                >
                                  {label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${{
                                    high: 'border-priority-high text-priority-high',
                                    medium: 'border-priority-medium text-priority-medium',
                                    low: 'border-priority-low text-priority-low',
                                  }[task.priority]}`}
                                >
                                  {task.priority} • {getXPForTask(task.priority)} XP
                                </Badge>
                                {(task.startDate || task.endDate || task.startTime || task.endTime) && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.startDate ? new Date(task.startDate).toLocaleDateString() : '—'}
                                    {task.startTime ? ` ${task.startTime}` : ''}
                                    {" "}-{" "}
                                    {task.endDate ? new Date(task.endDate).toLocaleDateString() : '—'}
                                    {task.endTime ? ` ${task.endTime}` : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {task.completed && (
                              <div className="text-right text-xs text-muted-foreground">
                                <p className="font-medium text-success">Completed</p>
                                <p>+{getXPForTask(task.priority)} XP</p>
                                <p>{task.completedAt?.toLocaleTimeString()}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;