import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function TransactionStatusBadge({ status, size = 'sm', showIcon = true }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved':
                return {
                    text: 'Approved',
                    icon: CheckCircle,
                    className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                };
            case 'rejected':
                return {
                    text: 'Rejected',
                    icon: XCircle,
                    className: 'text-red-500 bg-red-500/10 border-red-500/20'
                };
            case 'ft_submitted':
                return {
                    text: 'Pending',
                    icon: Clock,
                    className: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
                };
            case 'pending':
                return {
                    text: 'Pending',
                    icon: AlertCircle,
                    className: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                };
            default:
                return {
                    text: 'Unknown',
                    icon: Clock,
                    className: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
        xs: 'text-[10px] px-2 py-0.5',
        sm: 'text-xs px-2.5 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    const iconSizes = {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18
    };

    return (
        <div className={`
            inline-flex items-center gap-1.5 font-bold rounded-full border
            ${config.className} ${sizeClasses[size]}
        `}>
            {showIcon && <Icon size={iconSizes[size]} />}
            <span>{config.text}</span>
        </div>
    );
}