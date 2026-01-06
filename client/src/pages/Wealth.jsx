import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import Card from '../components/ui/Card';

export default function Wealth() {
    return (
        <div className="animate-fade-in p-5 py-8 min-h-screen bg-zinc-950">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 text-white text-center shadow-lg shadow-indigo-900/20 mb-8 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                        <TrendingUp className="text-primary-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Wealth Fund</h2>
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                        High yield asset management exclusively for Foxriver members.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="text-center py-16 border-dashed border-2 border-zinc-800 bg-zinc-900/50 shadow-none">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-sm">
                        <Zap className="text-zinc-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-[260px] mx-auto">
                        Our premium investment options are currently being optimized for maximum returns.
                    </p>
                </Card>

                <div className="bg-emerald-900/10 rounded-2xl p-4 flex items-center gap-4 border border-emerald-500/20">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 shadow-sm border border-emerald-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-0.5">Secure Assurance</p>
                        <p className="text-xs text-emerald-600/80 font-medium leading-snug">
                            All funds within the Wealth program are backed by Foxriver Reserve Capitals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
