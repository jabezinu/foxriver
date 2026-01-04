import { useState, useEffect } from 'react';
import { userAPI, depositAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiArrowLeft, HiCreditCard, HiCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

export default function Deposit() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Amount, 2: FT submission
    const [currentDeposit, setCurrentDeposit] = useState(null);
    const [ftNumber, setFtNumber] = useState('');

    const amounts = [3300, 9600, 27000, 50000, 78000, 100000, 150000, 200000];
    const methods = [
        { id: 'CBE', name: 'Commercial Bank of Ethiopia', account: '1000123456789' },
        { id: 'BOA', name: 'Bank of Abyssinia', account: '77889900' },
        { id: 'TeleBirr', name: 'TeleBirr', account: '0911223344' }
    ];

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await userAPI.getWallet();
            const walletData = res.data.wallet;
            setBalance(walletData.incomeWallet + walletData.personalWallet);
        } catch (error) {
            toast.error('Failed to update balance');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDeposit = async () => {
        if (!selectedAmount || !paymentMethod) {
            toast.error('Please select amount and payment method');
            return;
        }

        setSubmitting(true);
        try {
            const res = await depositAPI.create({
                amount: selectedAmount,
                paymentMethod
            });
            setCurrentDeposit(res.data.deposit);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create deposit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitFT = async () => {
        if (!ftNumber) {
            toast.error('Please enter FT number');
            return;
        }

        setSubmitting(true);
        try {
            await depositAPI.submitFT({
                depositId: currentDeposit._id,
                transactionFT: ftNumber
            });
            toast.success('Transaction FT submitted! Awaiting admin approval.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit FT');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">
                    <HiArrowLeft />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Deposit</h1>
            </div>

            <div className="px-3 py-6">
                {step === 1 ? (
                    <>
                        {/* Section 1: Account Balance */}
                        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm mb-6 border border-gray-50">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Account Balance</p>
                            <h2 className="text-2xl font-bold text-gray-900">{balance.toLocaleString()} ETB</h2>
                        </div>

                        {/* Section 2: Deposit Amount & Grid */}
                        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm mb-6 border border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-wider">Deposit Amount</h3>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-green-600">
                                        {selectedAmount ? selectedAmount.toLocaleString() : '0'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 ml-1">ETB</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1">
                                {amounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setSelectedAmount(amount)}
                                        className={`py-2 px-0 rounded-lg font-bold text-[9px] transition-all border-2 text-center flex items-center justify-center ${selectedAmount === amount
                                            ? 'border-green-500 bg-green-50 text-green-600'
                                            : 'border-gray-100 bg-white text-gray-600'
                                            }`}
                                    >
                                        {amount.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Payment Method Dropdown */}
                        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm mb-8 border border-gray-50">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Select Payment Method</label>
                            <div className="relative">
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full max-w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-3 py-4 font-bold text-xs text-gray-800 focus:border-green-500 outline-none transition-all cursor-pointer truncate pr-8"
                                >
                                    <option value="" disabled>Choose bank/service</option>
                                    {methods.map((method) => (
                                        <option key={method.id} value={method.id} className="text-sm">
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <HiCreditCard className="text-lg" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateDeposit}
                            disabled={submitting}
                            className="btn-primary w-full py-5 rounded-2xl uppercase tracking-[0.2em] text-xs font-black shadow-lg shadow-green-100"
                        >
                            {submitting ? <span className="spinner"></span> : 'Initialize Transfer'}
                        </button>
                    </>
                ) : (
                    <div className="animate-slideUp">
                        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mb-8 text-center">
                            <p className="text-green-800 font-bold mb-2">Deposit Request Created!</p>
                            <p className="text-green-600 text-sm">Please transfer <span className="font-bold">{selectedAmount} ETB</span> to the following account:</p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 border border-gray-50">
                            <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Payment Details</p>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Bank / Service</p>
                                    <p className="font-bold text-gray-800">{methods.find(m => m.id === paymentMethod)?.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Account Number</p>
                                    <p className="text-xl font-mono font-bold text-green-600">{methods.find(m => m.id === paymentMethod)?.account}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Account Name</p>
                                    <p className="font-bold text-gray-800 uppercase tracking-widest">Foxriver Ethiopia Co.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Enter Transaction FT Number</label>
                            <input
                                type="text"
                                value={ftNumber}
                                onChange={(e) => setFtNumber(e.target.value)}
                                placeholder="e.g. FT230104XXXX"
                                className="input-field py-4 font-mono text-center tracking-widest"
                            />
                            <p className="text-[10px] text-gray-400 mt-2 italic text-center">Transaction FT is required for manual approval</p>
                        </div>

                        <button
                            onClick={handleSubmitFT}
                            disabled={submitting}
                            className="btn-primary w-full py-4 uppercase tracking-widest text-sm"
                        >
                            {submitting ? <span className="spinner"></span> : 'Submit Payment'}
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className="w-full py-4 text-gray-400 font-bold text-xs uppercase mt-2"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
