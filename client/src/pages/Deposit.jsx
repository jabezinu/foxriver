import { useState, useEffect } from 'react';
import { userAPI, depositAPI, bankAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiArrowLeft, HiCreditCard, HiCheck, HiChevronDown } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';

export default function Deposit() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Amount, 2: FT submission
    const [currentDeposit, setCurrentDeposit] = useState(null);
    const [ftNumber, setFtNumber] = useState('');
    const [methods, setMethods] = useState([]);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const amounts = [3300, 9600, 27000, 50000, 78000, 100000, 150000, 200000];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, bankRes] = await Promise.all([
                    userAPI.getWallet(),
                    bankAPI.getBanks()
                ]);
                setBalance(walletRes.data.wallet.personalWallet);

                const bankMethods = bankRes.data.data.map(bank => ({
                    id: bank._id,
                    name: bank.bankName,
                    account: bank.accountNumber,
                    holder: bank.accountHolderName
                }));
                setMethods(bankMethods);
            } catch (error) {
                toast.error('Failed to load data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const res = await depositAPI.getUserDeposits();
                setHistory(res.data.deposits);
            } catch (error) {
                console.error('Failed to load history', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchData();
        fetchHistory();
    }, []);


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

        const formattedFT = ftNumber.trim().toUpperCase();

        if (formattedFT.length !== 12) {
            toast.error('FT Code must be exactly 12 characters');
            return;
        }

        if (!formattedFT.startsWith('FT')) {
            toast.error('FT Code must start with "FT"');
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

    const getSelectedMethodName = () => {
        const method = methods.find(m => m.id === paymentMethod);
        return method ? method.name : 'Choose bank/service';
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white px-6 py-5 flex items-center gap-6 sticky top-0 z-30 shadow-sm border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-800"
                >
                    <HiArrowLeft className="text-2xl" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Deposit</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 relative z-0">
                {step === 1 ? (
                    <>
                        {/* Section 1: Account Balance */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm mb-8 border border-gray-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Personal Wallet</p>
                                <div className="flex items-baseline gap-1">
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">{formatNumber(balance)}</h2>
                                    <span className="text-lg font-bold text-gray-400">ETB</span>
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-green-50 rounded-full opacity-50 pointer-events-none" />
                        </div>

                        {/* Section 2: Deposit Amount & Grid */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm mb-2 border border-gray-100">
                            <div className="flex justify-between items-end mb-6 px-1">
                                <h3 className="font-bold text-gray-800 text-base">Select Amount</h3>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-green-600">
                                        {selectedAmount ? formatNumber(selectedAmount) : '0'}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 ml-1">ETB</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {amounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setSelectedAmount(amount)}
                                        className={`py-4 px-2 rounded-2xl font-bold text-sm transition-all duration-200 border-2 flex items-center justify-center shadow-sm active:scale-95 ${selectedAmount === amount
                                            ? 'border-green-500 bg-green-50 text-green-700 shadow-green-100 ring-2 ring-green-100 ring-offset-2'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {formatNumber(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Payment Method Dropdown (Custom) */}
                        <div className="bg-white rounded-[2rem] p-2 shadow-sm mb-4 border border-gray-100 relative z-20">
                            <label className="block text-sm font-bold text-gray-700 mb-4 ml-1">Payment Method</label>

                            {/* Backdrop for clicking outside */}
                            {isDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-30 bg-black/5 backdrop-blur-[1px]"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                            )}

                            <div className="relative z-40">
                                {/* Trigger Button */}
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-200 group ${isDropdownOpen ? 'border-green-500 ring-4 ring-green-50 bg-white' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`shrink-0 p-2 rounded-xl transition-colors ${paymentMethod ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                                            }`}>
                                            <HiCreditCard className="text-2xl" />
                                        </div>
                                        <div className="text-left">
                                            <span className={`block font-bold text-base truncate ${paymentMethod ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {getSelectedMethodName()}
                                            </span>
                                            {paymentMethod && <span className="text-xs font-semibold text-gray-400 block mt-0.5">Selected Bank</span>}
                                        </div>
                                    </div>
                                    <HiChevronDown
                                        className={`text-2xl text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-green-500' : 'group-hover:text-gray-600'}`}
                                    />
                                </button>

                                {/* Dropdown List */}
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-100/50 z-50 overflow-hidden animate-springUp p-2">
                                        {methods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => {
                                                    setPaymentMethod(method.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full p-3 flex items-center justify-between transition-all rounded-2xl mb-1 last:mb-0 ${paymentMethod === method.id
                                                    ? 'bg-green-50 text-green-900'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${paymentMethod === method.id ? 'bg-white text-green-600 shadow-sm' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        <HiCreditCard className="text-lg" />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="font-bold text-base block">
                                                            {method.name}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-medium">Fast Transfer</span>
                                                    </div>
                                                </div>
                                                {paymentMethod === method.id && (
                                                    <div className="bg-green-500 text-white p-1 rounded-full">
                                                        <HiCheck className="text-sm" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleCreateDeposit}
                            disabled={submitting}
                            className="btn-primary w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98] transition-all transform disabled:opacity-70 disabled:hover:scale-100 mb-12"
                        >
                            {submitting ? <span className="spinner w-6 h-6 border-2"></span> : 'CONTINUE TO PAYMENT'}
                        </button>

                        {/* Section 4: History */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Recent Records</h3>
                                <div className="h-px flex-1 bg-gray-100 mx-4"></div>
                            </div>

                            {loadingHistory ? (
                                <div className="text-center py-10">
                                    <div className="spinner w-6 h-6 border-2 border-green-500 mx-auto"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-gray-100">
                                    <p className="text-gray-300 font-bold text-xs uppercase tracking-widest">No records found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((item) => (
                                        <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${item.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                    item.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-yellow-50 text-yellow-600'
                                                    }`}>
                                                    <HiCreditCard className="text-xl" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{formatNumber(item.amount)} ETB</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(item.createdAt).toLocaleDateString()} • {item.transactionFT || 'No FT'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {item.status === 'approved' ? 'Success' :
                                                    item.status === 'rejected' ? 'Failed' :
                                                        item.status === 'ft_submitted' ? 'Pending Approval' : 'Awaiting Payment'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="animate-slideUp max-w-xl mx-auto">
                        <div className="bg-green-50 border border-green-200 rounded-[2rem] p-8 mb-8 text-center relative overflow-hidden">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-green-500 text-3xl">
                                <HiCheck />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Created!</h3>
                            <p className="text-green-700 text-base leading-relaxed">
                                Please transfer exactly <span className="font-black text-green-800 bg-green-100 px-2 py-0.5 rounded-lg">{formatNumber(selectedAmount)} ETB</span> to the account below.
                            </p>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm mb-8 border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50">Payment Details</h4>
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <p className="text-sm font-medium text-gray-500">Bank Service</p>
                                    <p className="font-bold text-gray-900 text-lg">{methods.find(m => m.id === paymentMethod)?.name}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <p className="text-sm font-medium text-gray-500">Account Number</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-mono font-bold text-green-600 tracking-tight select-all">
                                            {methods.find(m => m.id === paymentMethod)?.account}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <p className="text-sm font-medium text-gray-500">Account Name</p>
                                    <p className="font-bold text-gray-800 text-lg">{methods.find(m => m.id === paymentMethod)?.holder}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Enter Transaction FT Number</label>
                            <input
                                type="text"
                                value={ftNumber}
                                onChange={(e) => setFtNumber(e.target.value.toUpperCase())}
                                placeholder="FT230104XXXX"
                                maxLength={12}
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-5 px-4 font-mono text-center tracking-widest text-lg focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all placeholder:text-gray-300"
                            />
                            <p className="text-xs text-gray-400 mt-3 text-center font-medium">
                                * The Transaction FT number (12 digits) is required for verification.
                            </p>
                        </div>

                        <button
                            onClick={handleSubmitFT}
                            disabled={submitting}
                            className="btn-primary w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-green-200 mb-4"
                        >
                            {submitting ? <span className="spinner w-6 h-6 border-2"></span> : 'SUBMIT PAYMENT'}
                        </button>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full py-4 text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors"
                        >
                            Cancel & Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
