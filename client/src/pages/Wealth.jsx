import { HiTrendingUp, HiShieldCheck, HiLightningBolt } from 'react-icons/hi';

export default function Wealth() {
    return (
        <div className="animate-fadeIn p-4 py-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-xl mb-8">
                <HiTrendingUp className="text-6xl mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Wealth Fund</h2>
                <p className="text-indigo-100 text-sm font-semibold uppercase tracking-widest leading-relaxed">High Yield Financial Management Tools</p>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <HiLightningBolt className="text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">Our premium Wealth Fund investment options are currently undergoing optimization for our Ethiopian users.</p>
                </div>

                <div className="card flex items-center gap-4 bg-green-50 border-green-100">
                    <HiShieldCheck className="text-3xl text-green-500" />
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-green-800 uppercase">Secure Assurance</p>
                        <p className="text-xs text-green-600">All funds are backed by Foxriver Reserve Capitals.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
