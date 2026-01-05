import { useState, useEffect } from 'react';
import { userAPI, withdrawalAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiArrowLeft, HiCash, HiEye, HiEyeOff, HiLibrary } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';

export default function Withdraw() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState({ incomeWallet: 0, personalWallet: 0 });
    const [profile, setProfile] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [walletType, setWalletType] = useState('income');
    const [transactionPassword, setTransactionPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const amounts = [100, 200, 3300, 9600, 10000, 27000, 50000, 78000, 100000, 300000, 500000];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, profileRes] = await Promise.all([
                userAPI.getWallet(),
                userAPI.getProfile()
            ]);
            setWallets(walletRes.data.wallet);
            setProfile(profileRes.data.user);
        } catch (error) {
            toast.error('Failed to load withdrawal data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!selectedAmount || !transactionPassword) {
            toast.error('Please select amount and enter transaction password');
            return;
        }

        if (wallets[`${walletType}Wallet`] < selectedAmount) {
            toast.error('Insufficient balance in selected wallet');
            return;
        }

        setSubmitting(true);
        try {
            await withdrawalAPI.create({
                amount: selectedAmount,
                walletType,
                transactionPassword
            });
            toast.success('Withdrawal request submitted! 10% tax applied. Awaiting admin approval.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed');
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
                {/* Wallet Balances Summary */}
                <div className="bg-white rounded-3xl p-5 shadow-sm mb-6 border border-gray-50 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-tighter">Income Balance</p>
                        <p className="text-lg font-bold text-gray-900">{formatNumber(wallets.incomeWallet)} <span className="text-[10px] text-gray-400">ETB</span></p>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-tighter">Personal Balance</p>
                        <p className="text-lg font-bold text-gray-900">{formatNumber(wallets.personalWallet)} <span className="text-[10px] text-gray-400">ETB</span></p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-wider">Withdrawal Amount</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-green-600">
                                {selectedAmount ? formatNumber(selectedAmount) : '0'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">ETB</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {amounts.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setSelectedAmount(amount)}
                                className={`py-3 rounded-xl font-bold text-xs transition-all border-2 ${selectedAmount === amount
                                    ? 'border-green-500 bg-green-50 text-green-600'
                                    : 'border-gray-100 bg-white text-gray-600'
                                    }`}
                            >
                                {formatNumber(amount)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Wallet Selector Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-50">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Withdraw From</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setWalletType('income')}
                            className={`py-4 rounded-2xl font-bold text-xs transition-all border-2 flex flex-col items-center gap-2 ${walletType === 'income'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-100 bg-white text-gray-400 opacity-60'
                                }`}
                        >
                            <span className="uppercase tracking-tighter">Income Balance</span>
                        </button>
                        <button
                            onClick={() => setWalletType('personal')}
                            className={`py-4 rounded-2xl font-bold text-xs transition-all border-2 flex flex-col items-center gap-2 ${walletType === 'personal'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-100 bg-white text-gray-400 opacity-60'
                                }`}
                        >
                            <span className="uppercase tracking-tighter">Personal Balance</span>
                        </button>
                    </div>
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
                                <span className="font-bold">{formatNumber(selectedAmount)} ETB</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-500">Tax (10%)</span>
                                <span className="font-bold text-red-500">-{formatNumber(taxAmount)} ETB</span>
                            </div>
                            <div className="pt-2 border-t border-blue-100 flex justify-between">
                                <span className="font-bold text-blue-800">Net Arrival</span>
                                <span className="font-bold text-xl text-green-600">{formatNumber(netAmount)} ETB</span>
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
