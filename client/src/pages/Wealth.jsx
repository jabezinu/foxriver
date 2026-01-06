import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import Card from '../components/ui/Card';

export default function Wealth() {
    return (
        <div className="animate-fade-in p-5 py-8 min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white text-center shadow-xl shadow-indigo-500/20 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                        <TrendingUp className="text-white" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Wealth Fund</h2>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                        High yield asset management exclusively for Foxriver members.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="text-center py-16 border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                        <Zap className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[260px] mx-auto">
                        Our premium investment options are currently being optimized for maximum returns.
                    </p>
                </Card>

                <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4 border border-emerald-100">
                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-0.5">Secure Assurance</p>
                        <p className="text-xs text-emerald-600 font-medium leading-snug">
                            All funds within the Wealth program are backed by Foxriver Reserve Capitals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
