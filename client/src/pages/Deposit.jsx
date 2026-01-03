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

    const amounts = [3300, 9600, 27000, 78000, 220000, 590000, 1280000, 2530000, 5000000, 9800000];
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
            setBalance(res.data.incomeWallet + res.data.personalWallet);
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

            <div className="px-4 py-6">
                {step === 1 ? (
                    <>
                        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-50">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Current Balance</p>
                            <h2 className="text-2xl font-bold text-gray-900">{balance} ETB</h2>
                        </div>

                        <h3 className="font-bold text-gray-800 mb-4">Select Deposit Amount</h3>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {amounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setSelectedAmount(amount)}
                                    className={`py-4 rounded-2xl font-bold transition-all border-2 ${selectedAmount === amount
                                        ? 'border-green-500 bg-green-50 text-green-600'
                                        : 'border-gray-100 bg-white text-gray-600'
                                        }`}
                                >
                                    {amount} ETB
                                </button>
                            ))}
                        </div>

                        <h3 className="font-bold text-gray-800 mb-4">Select Payment Method</h3>
                        <div className="space-y-3 mb-8">
                            {methods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`card flex items-center gap-4 cursor-pointer border-2 transition-all ${paymentMethod === method.id ? 'border-green-500 bg-green-50' : 'border-transparent'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <HiCreditCard className="text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{method.name}</p>
                                        <p className="text-[10px] text-gray-500">Fast & Secure Approval</p>
                                    </div>
                                    {paymentMethod === method.id && <HiCheck className="text-green-600 text-xl" />}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleCreateDeposit}
                            disabled={submitting}
                            className="btn-primary w-full py-4 uppercase tracking-widest text-sm"
                        >
                            {submitting ? <span className="spinner"></span> : 'Next Step'}
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
