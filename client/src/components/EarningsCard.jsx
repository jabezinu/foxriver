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
            className={`p-4 border-zinc-800 hover:border-primary-500/30 transition-all bg-zinc-900 ${onClick ? 'cursor-pointer group' : ''}`}
            onClick={onClick}
        >
            {compact ? (
                // Compact layout for summary view
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getColorClasses(color)} ${onClick ? 'group-hover:scale-110 transition-transform' : ''}`}>
                        <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
                        <p className={`text-lg font-bold ${getTextColor(color)} truncate`}>
                            {formatNumber(amount)}
                        </p>
                    </div>
                </div>
            ) : (
                // Full layout for detailed view
                <>
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg border ${getColorClasses(color)} ${onClick ? 'group-hover:scale-110 transition-transform' : ''}`}>
                            <Icon size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {title}
                        </span>
                    </div>
                    
                    <p className={`text-lg font-bold mb-1 ${getTextColor(color)}`}>
                        {formatNumber(amount)}
                    </p>
                    
                    {description && (
                        <p className="text-xs text-zinc-500 mb-2">{description}</p>
                    )}
                    
                    {details && (
                        <div className="space-y-1">
                            {Object.entries(details).map(([key, value]) => (
                                value > 0 && (
                                    <div key={key} className="flex justify-between text-xs">
                                        <span className="text-zinc-500 capitalize">{key}:</span>
                                        <span className="text-zinc-400">{formatNumber(value)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    
                    {amount === 0 && !details && (
                        <p className="text-xs text-zinc-500">No earnings yet</p>
                    )}
                </>
            )}
        </Card>
    );
};

export default EarningsCard;