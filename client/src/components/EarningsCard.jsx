import { formatNumber } from '../utils/formatNumber';
import Card from './ui/Card';

const EarningsCard = ({ 
    title, 
    amount, 
    icon: Icon, 
    color = 'emerald', 
    description, 
    details,
    onClick,
    compact = false
}) => {
    const getColorClasses = (color) => {
        const colors = {
            emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
            amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            green: 'bg-green-500/10 text-green-500 border-green-500/20',
            purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            red: 'bg-red-500/10 text-red-500 border-red-500/20',
            orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
        };
        return colors[color] || colors.emerald;
    };

    const getTextColor = (color) => {
        const colors = {
            emerald: 'text-emerald-400',
            blue: 'text-blue-400',
            violet: 'text-violet-400',
            amber: 'text-amber-400',
            green: 'text-green-400',
            purple: 'text-purple-400',
            red: 'text-red-400',
            orange: 'text-orange-400'
        };
        return colors[color] || colors.emerald;
    };

    return (
        <Card 
            className={`p-4 border transition-all duration-300 relative overflow-hidden ${onClick ? 'cursor-pointer group active:scale-[0.98]' : ''}`}
            style={{
                background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.95) 0%, rgba(39, 39, 42, 0.95) 100%)',
                borderColor: amount > 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(39, 39, 42, 0.3)',
                boxShadow: amount > 0 ? `0 10px 30px -10px rgba(0,0,0,0.5)` : 'none'
            }}
            onClick={onClick}
        >
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${getColorClasses(color).split(' ')[0]}`}></div>

            {compact ? (
                // Compact layout for summary view
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-2.5 rounded-xl border-2 shadow-lg ${getColorClasses(color).replace('10', '20')} ${onClick ? 'group-hover:scale-110 group-hover:rotate-3 transition-all duration-300' : ''}`}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">{title}</p>
                        <p className={`text-xl font-black ${getTextColor(color)} truncate drop-shadow-sm`}>
                            {formatNumber(amount)}
                        </p>
                    </div>
                </div>
            ) : (
                // Full layout for detailed view
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-xl border-2 shadow-lg ${getColorClasses(color).replace('10', '20')} ${onClick ? 'group-hover:scale-110 group-hover:rotate-3 transition-all duration-300' : ''}`}>
                            <Icon size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700/50">
                            {title}
                        </span>
                    </div>
                    
                    <div className="mb-3">
                        <p className={`text-2xl font-black mb-0.5 ${getTextColor(color).replace('400', '300')} drop-shadow-md`}>
                            {formatNumber(amount)}
                        </p>
                        {description && (
                            <p className="text-[11px] font-medium text-zinc-400 leading-tight">{description}</p>
                        )}
                    </div>
                    
                    {details && (
                        <div className="space-y-1.5 pt-3 border-t border-zinc-800/50">
                            {Object.entries(details).map(([key, value]) => (
                                value > 0 && (
                                    <div key={key} className="flex justify-between items-center text-[11px]">
                                        <span className="text-zinc-500 font-bold uppercase tracking-tight">{key}</span>
                                        <span className={`${getTextColor(color)} font-black`}>{formatNumber(value)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    
                    {amount === 0 && !details && (
                        <div className="pt-3 border-t border-zinc-800/50">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase italic">Waiting for earnings...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </div>
        </Card>
    );
};

export default EarningsCard;