import { useState, useEffect, useRef } from 'react';
import { 
  TreeDeciduous, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Droplets,
  Sun,
  Wind,
  Award,
  Target,
  Zap,
  Globe,
  Heart,
  Sprout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion, AnimatePresence } from 'motion/react';

interface TripImpact {
  tripId: string;
  distance: number; // in km
  co2Saved: number; // in kg
  isEcoFriendly: boolean; // carpooling = true, single = false
  timestamp: Date;
}

interface TreeStats {
  health: number; // 0-100
  level: number;
  totalDistance: number;
  co2Saved: number;
  co2Emitted: number;
  ecoTrips: number;
  harmfulTrips: number;
  leaves: number;
  badges: string[];
}

export function WorldTree() {
  const [treeStats, setTreeStats] = useState<TreeStats>({
    health: 50,
    level: 1,
    totalDistance: 0,
    co2Saved: 0,
    co2Emitted: 0,
    ecoTrips: 0,
    harmfulTrips: 0,
    leaves: 10,
    badges: [],
  });

  const [recentImpacts, setRecentImpacts] = useState<TripImpact[]>([]);
  const [showAnimation, setShowAnimation] = useState<'grow' | 'shrink' | null>(null);

  // Simulate trip impact (in real app, this would come from actual trip data)
  const animTimeoutRef = useRef<number | null>(null);

  const addTripImpact = (isEcoFriendly: boolean, distance: number) => {
    const co2PerKm = 0.12; // kg CO2 per km
    const carpoolReduction = 0.6; // 60% reduction when carpooling
    
    let co2Impact = distance * co2PerKm;
    
    const impact: TripImpact = {
      tripId: Math.random().toString(),
      distance,
      co2Saved: isEcoFriendly ? co2Impact * carpoolReduction : 0,
      isEcoFriendly,
      timestamp: new Date(),
    };

    const newStats = { ...treeStats };
    newStats.totalDistance += distance;

    if (isEcoFriendly) {
      // Eco-friendly trip: tree grows
      newStats.co2Saved += impact.co2Saved;
      newStats.ecoTrips += 1;
      newStats.health = Math.min(100, newStats.health + 5);
      newStats.leaves = Math.min(100, newStats.leaves + 2);
      setShowAnimation('grow');
    } else {
      // Harmful trip: tree degrades
      newStats.co2Emitted += co2Impact;
      newStats.harmfulTrips += 1;
      newStats.health = Math.max(0, newStats.health - 8);
      newStats.leaves = Math.max(0, newStats.leaves - 3);
      setShowAnimation('shrink');
    }

    // Level up system
    const newLevel = Math.floor(newStats.ecoTrips / 5) + 1;
    if (newLevel > newStats.level) {
      newStats.level = newLevel;
      newStats.badges.push(`Level ${newLevel} Eco Warrior`);
    }

    setTreeStats(newStats);
    setRecentImpacts(prev => [impact, ...prev.slice(0, 4)]);

    if (animTimeoutRef.current) {
      window.clearTimeout(animTimeoutRef.current);
    }
    animTimeoutRef.current = window.setTimeout(() => setShowAnimation(null), 1000);
  };

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) {
        window.clearTimeout(animTimeoutRef.current);
        animTimeoutRef.current = null;
      }
    };
  }, []);

  const getTreeStage = () => {
    if (treeStats.health >= 80) return { stage: 'thriving', emoji: '🌳', color: 'text-green-600' };
    if (treeStats.health >= 60) return { stage: 'healthy', emoji: '🌲', color: 'text-green-500' };
    if (treeStats.health >= 40) return { stage: 'growing', emoji: '🌱', color: 'text-lime-500' };
    if (treeStats.health >= 20) return { stage: 'struggling', emoji: '🍂', color: 'text-orange-500' };
    return { stage: 'wilting', emoji: '🥀', color: 'text-red-500' };
  };

  const treeStage = getTreeStage();
  const netImpact = treeStats.co2Saved - treeStats.co2Emitted;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          Your World Tree Journey
        </h1>
        <p className="text-muted-foreground">
          Every trip you take impacts the environment. Watch your tree grow or wilt based on your choices.
        </p>
      </div>

      {/* Main Tree Visualization */}
      <Card className="border-t-4 border-t-primary bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Tree Visual */}
            <motion.div
              animate={
                showAnimation === 'grow' 
                  ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                  : showAnimation === 'shrink'
                  ? { scale: [1, 0.9, 1], rotate: [0, -5, 5, 0] }
                  : {}
              }
              className="relative"
            >
              <div className={`text-9xl ${treeStage.color}`}>
                {treeStage.emoji}
              </div>
              
              {/* Floating particles */}
              <AnimatePresence>
                {showAnimation === 'grow' && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, x: 0, opacity: 1 }}
                        animate={{ 
                          y: -100, 
                          x: (Math.random() - 0.5) * 100,
                          opacity: 0 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, delay: i * 0.1 }}
                        className="absolute top-0 left-1/2 text-2xl"
                      >
                        ✨
                      </motion.div>
                    ))}
                  </>
                )}
                {showAnimation === 'shrink' && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ 
                          y: 50, 
                          x: (Math.random() - 0.5) * 50,
                          opacity: 0 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="absolute top-0 left-1/2 text-xl"
                      >
                        💨
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tree Status */}
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Level {treeStats.level} - {treeStage.stage}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Leaf className="h-4 w-4" />
                <span>{treeStats.leaves} leaves</span>
              </div>
            </div>

            {/* Health Bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  Tree Health
                </span>
                <span className={`font-semibold ${
                  treeStats.health >= 60 ? 'text-green-600' : 
                  treeStats.health >= 30 ? 'text-orange-600' : 
                  'text-red-600'
                }`}>
                  {treeStats.health}%
                </span>
              </div>
              <Progress 
                value={treeStats.health} 
                className={`h-4 ${
                  treeStats.health >= 60 ? '[&>div]:bg-green-500' : 
                  treeStats.health >= 30 ? '[&>div]:bg-orange-500' : 
                  '[&>div]:bg-red-500'
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distance Traveled</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {treeStats.totalDistance.toFixed(1)} km
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br border-2 ${
          netImpact >= 0 
            ? 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200'
            : 'from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net CO₂ Impact</p>
                <p className={`text-2xl font-bold ${
                  netImpact >= 0 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {netImpact >= 0 ? '+' : ''}{netImpact.toFixed(2)} kg
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                netImpact >= 0 
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : 'bg-red-100 dark:bg-red-900/40'
              }`}>
                {netImpact >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eco Trips</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {treeStats.ecoTrips}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Leaf className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solo Trips</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {treeStats.harmfulTrips}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <Wind className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="impact" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="impact">Impact Details</TabsTrigger>
          <TabsTrigger value="badges">Achievements</TabsTrigger>
          <TabsTrigger value="guide">Growth Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your last 5 trips and their environmental impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentImpacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sprout className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No trips yet. Start your journey to see your impact!</p>
                </div>
              ) : (
                recentImpacts.map((impact, i) => (
                  <div 
                    key={impact.tripId}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      impact.isEcoFriendly 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {impact.isEcoFriendly ? (
                        <Leaf className="h-5 w-5 text-green-600" />
                      ) : (
                        <Wind className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {impact.isEcoFriendly ? 'Carpooled' : 'Solo'} Trip
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {impact.distance.toFixed(1)} km
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        impact.isEcoFriendly ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {impact.isEcoFriendly ? '-' : '+'}{impact.co2Saved > 0 ? impact.co2Saved.toFixed(2) : (impact.distance * 0.12).toFixed(2)} kg CO₂
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Demo Buttons */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Simulate trips to see your tree change:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addTripImpact(true, Math.random() * 50 + 10)}
                    className="p-4 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900/60 border-2 border-green-300 transition-colors"
                  >
                    <Leaf className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Complete Eco Trip
                    </p>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addTripImpact(false, Math.random() * 50 + 10)}
                    className="p-4 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 border-2 border-red-300 transition-colors"
                  >
                    <Wind className="h-5 w-5 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Complete Solo Trip
                    </p>
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Achievements
              </CardTitle>
              <CardDescription>Badges earned through eco-friendly choices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {treeStats.badges.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Complete eco trips to earn badges!</p>
                  </div>
                ) : (
                  treeStats.badges.map((badge, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-300 rounded-lg"
                    >
                      <div className="text-3xl">🏆</div>
                      <div>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">{badge}</p>
                        <p className="text-xs text-muted-foreground">Unlocked!</p>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Locked badges */}
                <div className="flex items-center gap-3 p-4 bg-muted/30 border-2 border-dashed border-muted rounded-lg opacity-60">
                  <div className="text-3xl opacity-30">🏆</div>
                  <div>
                    <p className="font-semibold">10 Trip Eco Master</p>
                    <p className="text-xs text-muted-foreground">Complete 10 eco trips</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/30 border-2 border-dashed border-muted rounded-lg opacity-60">
                  <div className="text-3xl opacity-30">🌍</div>
                  <div>
                    <p className="font-semibold">Carbon Saver</p>
                    <p className="text-xs text-muted-foreground">Save 100kg of CO₂</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                How to Grow Your Tree
              </CardTitle>
              <CardDescription>Tips for maintaining a healthy World Tree</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Positive Actions (Tree Grows)
                    </h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• Carpool with others (+5% health per trip)</li>
                      <li>• Share rides and fill empty seats (+2 leaves)</li>
                      <li>• Choose routes with multiple passengers</li>
                      <li>• Use public transport connections</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Negative Actions (Tree Degrades)
                    </h4>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      <li>• Driving alone (-8% health per trip)</li>
                      <li>• Empty seats in your vehicle (-3 leaves)</li>
                      <li>• Short trips without passengers</li>
                      <li>• Declining carpool opportunities</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Real Impact
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Every carpooled trip saves approximately 60% of CO₂ emissions. 
                      A single 50km carpool can save up to 3.6kg of CO₂ - equivalent to 
                      planting a small tree for a day!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
