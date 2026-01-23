export default function TransactionProgress({ transaction, type }) {
    const getProgressSteps = (transaction, type) => {
        if (type === 'deposit') {
            return [
                { 
                    label: 'Request Created', 
                    completed: true, 
                    timestamp: transaction.createdAt 
                },
                { 
                    label: 'Payment Submitted', 
                    completed: ['ft_submitted', 'approved', 'rejected'].includes(transaction.status),
                    timestamp: transaction.status !== 'pending' ? transaction.updatedAt : null
                },
                { 
                    label: transaction.status === 'rejected' ? 'Rejected' : 'Approved & Credited', 
                    completed: ['approved', 'rejected'].includes(transaction.status),
                    timestamp: transaction.approvedAt || (transaction.status === 'rejected' ? transaction.updatedAt : null),
                    isRejected: transaction.status === 'rejected'
                }
            ];
        } else {
            return [
                { 
                    label: 'Request Submitted', 
                    completed: true, 
                    timestamp: transaction.createdAt 
                },
                { 
                    label: transaction.status === 'rejected' ? 'Rejected' : 'Approved & Processed', 
                    completed: ['approved', 'rejected'].includes(transaction.status),
                    timestamp: transaction.approvedAt || (transaction.status === 'rejected' ? transaction.updatedAt : null),
                    isRejected: transaction.status === 'rejected'
                }
            ];
        }
    };

    const steps = getProgressSteps(transaction, type);

    return (
        <div className="space-y-3">
            {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${step.completed 
                                ? step.isRejected 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-emerald-500 text-white'
                                : 'bg-zinc-700 text-zinc-400'
                            }
                        `}>
                            {step.completed ? (step.isRejected ? '✕' : '✓') : index + 1}
                        </div>
                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className={`
                                w-0.5 h-8 mt-1
                                ${step.completed 
                                    ? step.isRejected 
                                        ? 'bg-red-500/30' 
                                        : 'bg-emerald-500/30'
                                    : 'bg-zinc-700'
                                }
                            `} />
                        )}
                    </div>
                    
                    {/* Step content */}
                    <div className="flex-1 pb-6">
                        <p className={`text-sm font-medium ${
                            step.completed 
                                ? step.isRejected 
                                    ? 'text-red-400' 
                                    : 'text-emerald-400'
                                : 'text-zinc-500'
                        }`}>
                            {step.label}
                        </p>
                        {step.timestamp && (
                            <p className="text-xs text-zinc-600 mt-1">
                                {new Date(step.timestamp).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}