import React from 'react';

export default function StatCard({ label, value, icon, color = 'indigo', trend, trendLabel }) {
    const colorVariants = {
        indigo: 'from-indigo-500 to-purple-600 shadow-indigo-100',
        green: 'from-green-500 to-emerald-600 shadow-green-100',
        blue: 'from-blue-500 to-cyan-600 shadow-blue-100',
        red: 'from-red-500 to-pink-600 shadow-red-100',
    };

    const textColors = {
        indigo: 'text-indigo-600',
        green: 'text-green-600',
        blue: 'text-blue-600',
        red: 'text-red-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${colorVariants[color]} p-3 rounded-xl text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className={`text-2xl font-black ${textColors[color]} tracking-tighter`}>{value}</p>
                </div>
            </div>

            {(trend !== undefined || trendLabel) && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                        {typeof trend === 'object' ? trend.label || trendLabel : trendLabel}
                    </span>
                    {trend !== undefined && (
                        <span className={`text-xs font-bold ${typeof trend === 'object'
                                ? (trend.isPositive ? 'text-green-500' : 'text-emerald-500')
                                : (trend >= 0 ? 'text-green-500' : 'text-red-500')
                            }`}>
                            {typeof trend === 'object'
                                ? trend.value
                                : `${trend >= 0 ? '+' : ''}${trend}%`
                            }
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
