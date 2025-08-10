import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Target, Users, Shield } from 'lucide-react';
import AnimatedBackground from "@/components/AnimatedBackground";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { enableGuestMode, signIn, signUp } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setShowAuthDialog(true);
    setAuthMode('signin');
  };

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
        setShowAuthDialog(false);
        navigate('/dashboard');
      } else {
        await signUp(email, password, username || undefined, age ? parseInt(age) : undefined);
        setShowAuthDialog(false);
        // Show success message and redirect
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setAge('');
    setError(null);
  };

  const handleDialogChange = (open: boolean) => {
    setShowAuthDialog(open);
    if (!open) {
      resetForm();
    }
  };

  const handleGuestMode = () => {
    enableGuestMode();
    navigate('/dashboard');
  };
  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Task Management",
      description: "Organize tasks with AI-powered priority suggestions and intelligent categorization"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Gamified Experience",
      description: "Earn XP, level up, and unlock badges as you complete tasks"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Voice Input",
      description: "Add tasks quickly with voice commands and natural language processing"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaborative",
      description: "Share tasks and progress with team members and family"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is encrypted and stored securely in the cloud"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor your productivity with detailed analytics and insights"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <img src="/favicon.ico" alt="SmartDo Journey" className="h-8 w-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            SmartDo Journey
          </h1>
        </div>
        <ThemeSwitcher />
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 Transform Your Productivity Time
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Your Smart Task
            <br />
            Companion
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience the future of task management with AI-powered insights, 
            gamified productivity, and seamless collaboration. 
            Start your journey to better organization today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="px-8 py-6 text-lg font-semibold"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleGuestMode}
              className="px-8 py-6 text-lg font-semibold"
            >
              Try as Guest
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by Productivity Enthusiasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
                       </div>
           </div>
         </main>

         {/* Authentication Dialog */}
         <Dialog open={showAuthDialog} onOpenChange={handleDialogChange}>
           <DialogContent className="sm:max-w-[425px]">
             <DialogHeader>
               <DialogTitle>Welcome to SmartDo Journey</DialogTitle>
               <DialogDescription>
                 {authMode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
               </DialogDescription>
             </DialogHeader>
             
             <Tabs value={authMode} onValueChange={(value) => {
               setAuthMode(value as 'signin' | 'signup');
               resetForm();
             }}>
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="signin">Sign In</TabsTrigger>
                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
               </TabsList>
               
               <TabsContent value="signin" className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input
                     id="email"
                     type="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="password">Password</Label>
                   <Input
                     id="password"
                     type="password"
                     placeholder="Enter your password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
                 {error && <p className="text-sm text-destructive">{error}</p>}
                 <Button 
                   onClick={handleAuth} 
                   disabled={loading || !email || !password}
                   className="w-full"
                 >
                   {loading ? 'Signing In...' : 'Sign In'}
                 </Button>
               </TabsContent>
               
               <TabsContent value="signup" className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signup-email">Email</Label>
                   <Input
                     id="signup-email"
                     type="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="signup-password">Password</Label>
                   <Input
                     id="signup-password"
                     type="password"
                     placeholder="Create a password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="username">Username (Optional)</Label>
                   <Input
                     id="username"
                     placeholder="Enter username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="age">Age (Optional)</Label>
                   <Input
                     id="age"
                     type="number"
                     placeholder="Enter your age"
                     value={age}
                     onChange={(e) => setAge(e.target.value)}
                   />
                 </div>
                 {error && <p className="text-sm text-destructive">{error}</p>}
                 <Button 
                   onClick={handleAuth} 
                   disabled={loading || !email || !password}
                   className="w-full"
                 >
                   {loading ? 'Creating Account...' : 'Create Account'}
                 </Button>
               </TabsContent>
             </Tabs>
           </DialogContent>
         </Dialog>

         {/* Footer */}
         <footer className="relative z-10 text-center py-8 text-muted-foreground">
           <p>&copy; 2024 SmartDo Journey. Built by SPARKLE</p>
         </footer>
       </div>
     );
   };

export default Welcome; 