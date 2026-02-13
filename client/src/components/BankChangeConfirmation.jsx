import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './ui/Button';

export default function BankChangeConfirmation({ bankChangeInfo, onConfirmed, onDeclined, profile }) {
    const { confirmBankChange, loading } = useUserStore();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Show modal if confirmation is needed
        if (bankChangeInfo?.needsConfirmation) {
            setShowModal(true);
        }
    }, [bankChangeInfo]);

    const handleConfirm = async (confirmed) => {
        const res = await confirmBankChange(confirmed);
        
        if (res.success) {
            if (res.data.declined) {
                toast.error('Bank account change request declined');
                setShowModal(false);
                if (onDeclined) onDeclined();
            } else if (res.data.completed) {
                toast.success('Bank account successfully updated!');
                setShowModal(false);
                if (onConfirmed) onConfirmed();
            } else {
                toast.success(res.data.message);
                setShowModal(false);
                if (onConfirmed) onConfirmed();
            }
        } else {
            toast.error(res.message);
        }
    };

    if (!bankChangeInfo?.needsConfirmation) return null;

    // Get account info from profile if available, otherwise from bankChangeInfo
    const oldAccount = profile?.bankAccount || bankChangeInfo.oldAccount;
    const newAccount = profile?.pendingBankAccount || bankChangeInfo.newAccount;

    return (
        <Modal 
            isOpen={showModal} 
            onClose={() => {}} 
            title="Bank Account Change Confirmation"
            closeOnOutsideClick={false}
        >
            <div className="space-y-5">
                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-amber-500 font-bold text-sm mb-1">
                                Daily Confirmation Required
                            </p>
                            <p className="text-amber-200/80 text-xs leading-relaxed">
                                You need to confirm this bank account change once per day for 3 consecutive days.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-3 uppercase font-bold tracking-wide">
                        Confirmation Progress
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                        {[1, 2, 3].map((day) => (
                            <div key={day} className="flex-1">
                                <div className={`h-2 rounded-full ${
                                    day <= (bankChangeInfo.confirmationCount || 0)
                                        ? 'bg-primary-500'
                                        : 'bg-zinc-700'
                                }`} />
                                <p className={`text-xs text-center mt-1 ${
                                    day <= (bankChangeInfo.confirmationCount || 0)
                                        ? 'text-primary-500 font-bold'
                                        : 'text-zinc-500'
                                }`}>
                                    Day {day}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-zinc-400 text-center">
                        Confirmation {(bankChangeInfo.confirmationCount || 0) + 1} of 3
                    </p>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-zinc-500 font-bold mb-2">Current Account:</p>
                        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                            <p className="text-sm text-white font-medium">
                                {oldAccount?.bank || 'N/A'}
                            </p>
                            <p className="text-xs text-zinc-400">
                                {oldAccount?.accountNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-zinc-400">
                                {oldAccount?.accountName || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="text-primary-500">↓</div>
                    </div>

                    <div>
                        <p className="text-xs text-zinc-500 font-bold mb-2">New Account:</p>
                        <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/20">
                            <p className="text-sm text-white font-medium">
                                {newAccount?.bank || 'N/A'}
                            </p>
                            <p className="text-xs text-primary-300">
                                {newAccount?.accountNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-primary-300">
                                {newAccount?.accountName || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-300 leading-relaxed">
                        Do you confirm this bank account change? If you select "No", the request will be declined.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                        onClick={() => handleConfirm(false)}
                        variant="danger"
                        disabled={loading}
                        className="flex items-center justify-center gap-2"
                    >
                        <XCircle size={18} />
                        No
                    </Button>
                    <Button
                        onClick={() => handleConfirm(true)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 shadow-glow"
                    >
                        <CheckCircle size={18} />
                        Yes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
