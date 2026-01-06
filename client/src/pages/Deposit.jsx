import { useState, useEffect } from 'react';
import { userAPI, depositAPI, bankAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CreditCard, Check, ChevronDown, History, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
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
            toast.success('Transaction submitted! Awaiting approval.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit FT');
        } finally {
            setSubmitting(false);
        }
    };

    const getSelectedMethodName = () => {
        const method = methods.find(m => m.id === paymentMethod);
        return method ? method.name : 'Select Payment Method';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 pb-8 animate-fade-in">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Deposit</h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {step === 1 ? (
                    <>
                        {/* Section 1: Account Balance */}
                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-2">Personal Wallet</p>
                                <div className="flex items-baseline gap-1">
                                    <h2 className="text-3xl font-bold tracking-tight">{formatNumber(balance)}</h2>
                                    <span className="text-sm font-medium opacity-80">ETB</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Deposit Amount */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="font-bold text-gray-900 text-sm">Select Amount</h3>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-primary-600">
                                        {selectedAmount ? formatNumber(selectedAmount) : '0'}
                                    </span>
                                    <span className="text-xs font-medium text-gray-400 ml-1">ETB</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {amounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setSelectedAmount(amount)}
                                        className={`
                                            py-3 px-1 rounded-xl font-bold text-sm transition-all duration-200 
                                            border flex items-center justify-center relative overflow-hidden
                                            ${selectedAmount === amount
                                                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {formatNumber(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Payment Method Dropdown */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Payment Method</label>
                            <div className="relative z-20">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`
                                        w-full bg-white border rounded-xl px-4 py-3.5 flex items-center justify-between 
                                        transition-all duration-200 shadow-sm
                                        ${isDropdownOpen ? 'border-primary-500 ring-2 ring-primary-50' : 'border-gray-200 hover:border-gray-300'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${paymentMethod ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className={`block font-semibold text-sm ${paymentMethod ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {getSelectedMethodName()}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-slide-up p-1.5">
                                            {methods.map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => {
                                                        setPaymentMethod(method.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`
                                                        w-full p-3 flex items-center justify-between transition-all rounded-xl mb-1 last:mb-0
                                                        ${paymentMethod === method.id
                                                            ? 'bg-primary-50 text-primary-900'
                                                            : 'hover:bg-gray-50 text-gray-700'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-semibold text-sm block">
                                                                {method.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {paymentMethod === method.id && (
                                                        <Check size={16} className="text-primary-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateDeposit}
                            loading={submitting}
                            disabled={submitting}
                            size="lg"
                            className="w-full mb-10 shadow-lg shadow-primary-200"
                        >
                            Continue to Payment
                        </Button>

                        {/* Section 4: History */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <History size={18} className="text-gray-400" />
                                <h3 className="font-bold text-gray-700 text-sm">Recent Activity</h3>
                            </div>

                            {loadingHistory ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <p className="text-xs text-gray-400 font-medium">No records found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((item) => (
                                        <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    p-2.5 rounded-xl
                                                    ${item.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                        item.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                            'bg-amber-50 text-amber-600'}
                                                `}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{formatNumber(item.amount)} ETB</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`
                                                text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                                                ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'}
                                            `}>
                                                {item.status === 'approved' ? 'Success' :
                                                    item.status === 'rejected' ? 'Failed' :
                                                        item.status === 'ft_submitted' ? 'Pending' : 'Unpaid'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="animate-slide-up">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-6 text-center">
                            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-500">
                                <Check size={28} strokeWidth={3} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Request Created</h3>
                            <p className="text-emerald-700 text-sm leading-relaxed max-w-xs mx-auto">
                                Transfer exactly <span className="font-bold bg-white px-1.5 py-0.5 rounded text-emerald-800">{formatNumber(selectedAmount)} ETB</span>
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-50">
                                Bank Details
                            </h4>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Bank Name</p>
                                        <p className="font-bold text-gray-900">{methods.find(m => m.id === paymentMethod)?.name}</p>
                                    </div>

                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-500 mb-0.5">Account Number</p>
                                        <p className="font-mono font-bold text-gray-900 text-lg tracking-tight truncate">
                                            {methods.find(m => m.id === paymentMethod)?.account}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(methods.find(m => m.id === paymentMethod)?.account)}
                                        className="p-2 text-primary-600 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Account Holder</p>
                                    <p className="font-bold text-gray-900">{methods.find(m => m.id === paymentMethod)?.holder}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <Card className="p-5 border-primary-100 shadow-sm">
                                <label className="block text-sm font-bold text-gray-800 mb-3 text-center">Enter Transaction FT Number</label>
                                <Input
                                    value={ftNumber}
                                    onChange={(e) => setFtNumber(e.target.value.toUpperCase())}
                                    placeholder="FT230104XXXX"
                                    maxLength={12}
                                    className="text-center font-mono tracking-widest text-lg py-3 uppercase placeholder:normal-case placeholder:tracking-normal"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 text-center">
                                    Enter the 12-digit transaction reference number from your bank app.
                                </p>
                            </Card>
                        </div>

                        <Button
                            onClick={handleSubmitFT}
                            loading={submitting}
                            disabled={submitting}
                            size="lg"
                            className="w-full mb-3 shadow-lg shadow-primary-200"
                        >
                            Submit Payment
                        </Button>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full py-3 text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
