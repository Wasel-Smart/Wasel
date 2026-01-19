import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ShieldAlert,
    Package,
    MapPin,
    CheckCircle2,
    Medal,
    Users,
    ArrowRight,
    TrendingUp,
    Gift,
    Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { HeroTask, heroService } from '../services/heroService';
import { toast } from 'sonner';

export function WaselHero() {
    const [tasks, setTasks] = useState<HeroTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<HeroTask | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const availableTasks = await heroService.discoverTasks(25.2, 55.2);
        setTasks(availableTasks);
        setLoading(false);
    };

    const handleAccept = async (task: HeroTask) => {
        const success = await heroService.acceptTask(task.id, 'current-user-id'); // In real app use auth context
        if (success) {
            toast.success('You are now a Wasel Hero! Complete the delivery to earn credits.');
            setActiveTask(task);
            fetchTasks();
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">Community Service</Badge>
                        <h1 className="text-4xl font-black">Wasel Hero (بطل واصل)</h1>
                        <p className="text-teal-50 max-w-md opacity-90">
                            Deliver packages or help neighbors during your existing journey and earn up to 5x more credits. Help your community while moving!
                        </p>
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                                <Users className="w-4 h-4" />
                                <span>2.4k Heros Active</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                                <Medal className="w-4 h-4" />
                                <span>Level 4 Hero</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Heart className="w-32 h-32 text-white/20 fill-white/10" />
                        </motion.div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Tasks List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            Open Hero Tasks
                            <Badge variant="outline" className="ml-2">{tasks.length} Available</Badge>
                        </h2>
                        <Button variant="ghost" size="sm" onClick={fetchTasks} disabled={loading}>Refresh</Button>
                    </div>

                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="grid gap-4">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layoutId={task.id}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg transition-all"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                                                <Package className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg capitalize">{task.package_size} Delivery</span>
                                                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200">
                                                        Express
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {task.from_location.split(',')[0]} → {task.to_location.split(',')[0]}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-teal-600">+{task.reward_credits}</div>
                                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Hero Credits</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="rounded-xl bg-teal-600 hover:bg-teal-700 h-10 px-6 font-bold"
                                                onClick={() => handleAccept(task)}
                                            >
                                                Accept Task
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold">All hero tasks completed!</h3>
                            <p className="text-slate-500">Check back later for new community requests.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Leaderboard & Stats */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Medal className="w-5 h-5 text-amber-500" />
                                Hero Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Ahmed K.', tasks: 124, credits: 6200, avatar: 'AK' },
                                { name: 'Sarah M.', tasks: 98, credits: 4900, avatar: 'SM' },
                                { name: 'Omar J.', tasks: 87, credits: 4350, avatar: 'OJ' }
                            ].map((hero, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">
                                            {hero.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{hero.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{hero.tasks} tasks completed</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-teal-600 font-bold">{hero.credits}</Badge>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs text-teal-600" onClick={() => toast.info('Leaderboard coming soon!')}>
                                View Global Rankings
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-teal-600 text-white shadow-xl overflow-hidden relative">
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Gift className="w-5 h-5" />
                                Special Reward
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <p className="text-sm text-teal-50">Complete 3 more hero tasks this week to unlock a Free Scooter Ride Pass!</p>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Progress</span>
                                    <span>1/3</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full">
                                    <div className="h-full w-1/3 bg-white rounded-full shadow-lg" />
                                </div>
                            </div>
                            <Button className="w-full bg-white text-teal-600 font-bold hover:bg-teal-50 border-0">
                                Claim Pass
                            </Button>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-16 -mr-16 blur-2xl" />
                    </Card>
                </div>
            </div>
        </div>
    );
}
