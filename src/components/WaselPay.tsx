import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    ShieldCheck,
    CreditCard,
    QrCode,
    Heart,
    ChevronRight,
    Zap,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { paymentService, Transaction, WalletBalance } from '../services/paymentService';
import { toast } from 'sonner';

export function WaselPay() {
    const [balance, setBalance] = useState<WalletBalance>({ aed: 0, credits: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        setLoading(true);
        const [b, tx] = await Promise.all([
            paymentService.getBalance('user-123'),
            paymentService.getRecentTransactions('user-123')
        ]);
        setBalance(b);
        setTransactions(tx);
        setLoading(false);
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Glassmorphic Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-8 shadow-2xl text-white"
            >
                <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-teal-100/80 text-sm font-medium tracking-wide">Wasel Pay Balance</p>
                            <h2 className="text-5xl font-black tabular-nums">
                                <span className="text-2xl font-light mr-1">AED</span>
                                {balance.aed.toFixed(2)}
                            </h2>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                            <QrCode className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button className="flex-1 bg-white text-teal-700 hover:bg-teal-50 font-bold h-14 rounded-2xl shadow-lg border-0">
                            <Plus className="mr-2 w-5 h-5" /> Top Up
                        </Button>
                        <Button variant="outline" className="flex-1 bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white/20 font-bold h-14 rounded-2xl">
                            <ArrowUpRight className="mr-2 w-5 h-5" /> Send
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-teal-100/60 uppercase font-black tracking-widest">Rewards Wallet</p>
                                <p className="font-bold">{balance.credits} Credits</p>
                            </div>
                        </div>
                        <Badge className="bg-white/20 text-white hover:bg-white/30 cursor-pointer">
                            Convert to AED
                        </Badge>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full -ml-10 -mb-10 blur-2xl" />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Transaction History */}
                <Card className="lg:col-span-2 border-0 shadow-xl bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 rounded-[2rem]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-teal-600" />
                            Recent Activity
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-teal-600 font-bold">See All</Button>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse mb-3" />
                            ))
                        ) : transactions.map((tx, idx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tx.type === 'reward' ? 'bg-emerald-50 text-emerald-600' :
                                            tx.type === 'escrow_release' ? 'bg-teal-50 text-teal-600' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {tx.type === 'reward' ? <Zap className="w-5 h-5" /> :
                                            tx.type === 'escrow_release' ? <ShieldCheck className="w-5 h-5" /> :
                                                tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                                        <p className="text-xs text-slate-400">
                                            {tx.type === 'escrow_release' ? 'Verified Settlement' :
                                                tx.type === 'reward' ? 'Eco Earnings' : 'Direct Payment'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black ${tx.currency === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                        {tx.currency === 'AED' ? `AED ${tx.amount.toFixed(2)}` : `+${tx.amount} Credits`}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>

                {/* Payment Security & Extras */}
                <div className="space-y-6">
                    {/* Sadaka Round-up Card */}
                    <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-[2rem] overflow-hidden relative group">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Heart className="w-5 h-5 fill-white" />
                                </div>
                                <h3 className="font-black text-rose-900 dark:text-rose-400">Sadaka Round-up</h3>
                            </div>
                            <p className="text-xs text-rose-700/70 dark:text-rose-400/70 leading-relaxed">
                                We've collected **AED 12.45** in round-ups this month for local student transport.
                            </p>
                            <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Enable on all rides</span>
                                <div className="w-10 h-5 bg-rose-500 rounded-full relative">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Badge */}
                    <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-wider">Trusted Settlement</span>
                        </div>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 font-medium">
                            Wasel uses military-grade encryption for all regional transactions. PCI-DSS Level 1 Compliant.
                        </p>
                    </div>

                    <Button variant="ghost" className="w-full text-teal-600 font-bold gap-2">
                        <CreditCard className="w-4 h-4" /> Manage Payment Methods
                    </Button>
                </div>
            </div>
        </div>
    );
}
