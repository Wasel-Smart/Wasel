import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bike,
    Car,
    UserPlus,
    ThermometerSun,
    Clock,
    MapPin,
    MoveRight,
    ChevronRight,
    ShieldCheck,
    Zap,
    Leaf,
    Navigation,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { intermodalService, IntermodalJourney, RouteSegment } from '../services/intermodalService';
import { MapComponent } from './MapComponent';

export function IntermodalPlanner() {
    const [loading, setLoading] = useState(false);
    const [journeys, setJourneys] = useState<IntermodalJourney[]>([]);
    const [selectedJourney, setSelectedJourney] = useState<IntermodalJourney | null>(null);
    const [prefs, setPrefs] = useState({
        femaleOnly: false,
        comfortFirst: true,
        prayerTimeStop: false
    });

    const handleSearch = async () => {
        setLoading(true);
        try {
            // Mock locations for demo
            const marina = { lat: 25.19, lng: 55.19, address: 'Dubai Marina' };
            const downtown = { lat: 25.41, lng: 55.41, address: 'Sharjah City Center' };

            const results = await intermodalService.planJourney(marina, downtown, {
                femaleOnly: prefs.femaleOnly
            });
            setJourneys(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSegmentIcon = (type: string) => {
        switch (type) {
            case 'scooter': return <Bike className="w-4 h-4" />;
            case 'carpool': return <Car className="w-4 h-4" />;
            default: return <Navigation className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-teal-700 dark:text-teal-400">Intermodal Journey Planner</CardTitle>
                            <CardDescription>Multi-leg routes designed for the Middle East climate & culture</CardDescription>
                        </div>
                        <Zap className="w-8 h-8 text-teal-500 animate-pulse" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-pink-500" />
                                    Gender Privacy
                                </Label>
                                <p className="text-xs text-muted-foreground">Female-only carpool matches</p>
                            </div>
                            <Switch
                                checked={prefs.femaleOnly}
                                onCheckedChange={(v) => setPrefs(prev => ({ ...prev, femaleOnly: v }))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <ThermometerSun className="w-4 h-4 text-orange-500" />
                                    Beat the Heat
                                </Label>
                                <p className="text-xs text-muted-foreground">Minimize walking in peak sun</p>
                            </div>
                            <Switch
                                checked={prefs.comfortFirst}
                                onCheckedChange={(v) => setPrefs(prev => ({ ...prev, comfortFirst: v }))}
                            />
                        </div>

                        <Button size="lg" className="h-full rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold" onClick={handleSearch} disabled={loading}>
                            {loading ? 'Analyzing Routes...' : 'Plan Smart Journey'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Results List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Suggested Smart Routes
                        {journeys.length > 0 && <Badge variant="outline">{journeys.length}</Badge>}
                    </h2>

                    <AnimatePresence>
                        {journeys.map((journey, idx) => (
                            <motion.div
                                key={journey.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedJourney(journey)}
                                className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all p-5 ${selectedJourney?.id === journey.id ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30' : 'border-slate-100 hover:border-teal-300 dark:border-slate-800'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {journey.segments.map((seg, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${seg.type === 'scooter' ? 'bg-green-100 text-green-700' : seg.type === 'carpool' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {getSegmentIcon(seg.type)}
                                                </div>
                                                {sIdx < journey.segments.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-teal-600">AED {journey.totalPrice}</div>
                                        <div className="text-xs text-muted-foreground">{journey.totalDurationMinutes} mins • {journey.totalDistanceKm.toFixed(1)} km</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <span>Comfort Score</span>
                                            <span className={journey.comfortScore > 7 ? 'text-emerald-500' : 'text-orange-500'}>{journey.comfortScore}/10</span>
                                        </div>
                                        <Progress value={journey.comfortScore * 10} className={`h-1.5 ${journey.comfortScore > 7 ? 'bg-emerald-100' : 'bg-orange-100'}`} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-emerald-600">-{journey.co2SavedKg}kg CO₂</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Selected Journey Visualizer */}
                <div className="space-y-6">
                    {selectedJourney ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <PremiumCard className="overflow-hidden border-0 shadow-2xl">
                                <MapComponent
                                    height="300px"
                                    className="rounded-b-none"
                                    locations={selectedJourney.segments.flatMap((s, idx) => [
                                        { lat: s.from.lat, lng: s.from.lng, label: `${s.type} start`, type: s.type as any },
                                        { lat: s.to.lat, lng: s.to.lng, label: `${s.type} end`, type: s.type as any }
                                    ])}
                                    showRoute={true}
                                />
                                <PremiumCardContent className="p-6 space-y-6">
                                    <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-950/30 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-6 h-6 text-teal-600" />
                                            <div>
                                                <p className="text-sm font-bold text-teal-900 dark:text-teal-400">Total Journey Confidence</p>
                                                <p className="text-xs text-teal-700/70">Wassel Verified Providers Only</p>
                                            </div>
                                        </div>
                                        <Button size="sm" className="bg-teal-600">Book All</Button>
                                    </div>

                                    <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                        {selectedJourney.segments.map((seg, idx) => (
                                            <div key={idx} className="relative">
                                                <div className={`absolute -left-7 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 z-10 ${seg.type === 'scooter' ? 'bg-green-500' : seg.type === 'carpool' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-black capitalize flex items-center gap-2">
                                                            {getSegmentIcon(seg.type)}
                                                            {seg.type} Segment
                                                        </span>
                                                        <span className="text-xs font-bold text-muted-foreground">{seg.durationMinutes} mins</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{seg.from.address} → {seg.to.address}</p>
                                                    {seg.isFemaleOnly && (
                                                        <Badge variant="outline" className="w-fit text-pink-600 bg-pink-50 border-pink-200 text-[10px] mt-1">
                                                            Exclusive: Female Only
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </PremiumCardContent>
                            </PremiumCard>
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-muted-foreground p-8 text-center bg-slate-50/50 dark:bg-slate-950/20">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Navigation className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold">Select a journey to view details</h3>
                            <p className="text-sm max-w-[250px] mx-auto">We'll show you the exact route, transfer points, and comfort metrics.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-components to keep types clean
function PremiumCard({ children, className, ...props }: any) {
    return <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden ${className}`} {...props}>{children}</div>;
}
function PremiumCardContent({ children, className, ...props }: any) {
    return <div className={`p-6 ${className}`} {...props}>{children}</div>;
}
