import { useState, useEffect } from 'react';
import { userAPI, withdrawalAPI } from '../services/api';
import { HiArrowLeft, HiCash, HiEye, HiEyeOff } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

export default function Withdraw() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState({ incomeWallet: 0, personalWallet: 0 });
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [walletType, setWalletType] = useState('income');
    const [transactionPassword, setTransactionPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const amounts = [1000, 3000, 5000, 10000, 20000, 50000];

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const res = await userAPI.getWallet();
            setWallets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!selectedAmount || !transactionPassword) {
            alert('Please select amount and enter transaction password');
            return;
        }

        if (wallets[`${walletType}Wallet`] < selectedAmount) {
            alert('Insufficient balance in selected wallet');
            return;
        }

        setSubmitting(true);
        try {
            await withdrawalAPI.create({
                amount: selectedAmount,
                walletType,
                transactionPassword
            });
            alert('Withdrawal request submitted! 10% tax applied. Awaiting admin approval.');
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Withdrawal failed');
        } finally {
            setSubmitting(false);
        }
    };

    const netAmount = selectedAmount ? selectedAmount * 0.9 : 0;
    const taxAmount = selectedAmount ? selectedAmount * 0.1 : 0;

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">
                    <HiArrowLeft />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Withdraw</h1>
            </div>

            <div className="px-4 py-6">
                {/* Wallet Selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div
                        onClick={() => setWalletType('income')}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${walletType === 'income' ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'
                            }`}
                    >
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Income Wallet</p>
                        <p className="font-bold text-gray-800">{wallets.incomeWallet} ETB</p>
                    </div>
                    <div
                        onClick={() => setWalletType('personal')}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${walletType === 'personal' ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'
                            }`}
                    >
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Personal Wallet</p>
                        <p className="font-bold text-gray-800">{wallets.personalWallet} ETB</p>
                    </div>
                </div>

                <h3 className="font-bold text-gray-800 mb-4">Select Withdrawal Amount</h3>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {amounts.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${selectedAmount === amount
                                    ? 'border-green-500 bg-green-50 text-green-600'
                                    : 'border-gray-100 bg-white text-gray-600'
                                }`}
                        >
                            {amount}
                        </button>
                    ))}
                </div>

                {/* Tax Info Card */}
                {selectedAmount && (
                    <div className="bg-blue-50 rounded-3xl p-6 mb-8 border border-blue-100 animate-slideUp">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-blue-600 font-semibold">Withdrawal Summary</span>
                            <HiCash className="text-blue-500 text-2xl" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-500">Gross Amount</span>
                                <span className="font-bold">{selectedAmount} ETB</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-500">Tax (10%)</span>
                                <span className="font-bold text-red-500">-{taxAmount} ETB</span>
                            </div>
                            <div className="pt-2 border-t border-blue-100 flex justify-between">
                                <span className="font-bold text-blue-800">Net Arrival</span>
                                <span className="font-bold text-xl text-green-600">{netAmount} ETB</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Transaction Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={transactionPassword}
                            onChange={(e) => setTransactionPassword(e.target.value)}
                            placeholder="Enter 6-digit password"
                            className="input-field py-4 tracking-widest text-center"
                            maxLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <HiEyeOff /> : <HiEye />}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center uppercase font-bold tracking-tighter">Required to authorize fund transfer</p>
                </div>

                <button
                    onClick={handleWithdraw}
                    disabled={submitting}
                    className="btn-primary w-full py-4 uppercase tracking-widest text-sm"
                >
                    {submitting ? <span className="spinner"></span> : 'Submit Request'}
                </button>
            </div>
        </div>
    );
}
