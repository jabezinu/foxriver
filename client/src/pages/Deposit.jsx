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
        <div className="min-h-screen bg-zinc-950 pb-8 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Deposit</h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {step === 1 ? (
                    <>
                        {/* Section 1: Account Balance */}
                        <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500 rounded-2xl p-6 text-black shadow-lg shadow-primary-500/20 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-black/70 text-xs font-bold uppercase tracking-wider mb-2">Personal Wallet</p>
                                <div className="flex items-baseline gap-1">
                                    <h2 className="text-3xl font-black tracking-tight">{formatNumber(balance)}</h2>
                                    <span className="text-sm font-bold opacity-80">ETB</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Deposit Amount */}
                        <div className="bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-800 mb-6">
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="font-bold text-white text-sm">Select Amount</h3>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-primary-500">
                                        {selectedAmount ? formatNumber(selectedAmount) : '0'}
                                    </span>
                                    <span className="text-xs font-medium text-zinc-500 ml-1">ETB</span>
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
                                                ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-glow'
                                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
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
                            <label className="block text-sm font-bold text-zinc-400 mb-2 ml-1 uppercase tracking-wider text-[10px]">Payment Method</label>
                            <div className="relative z-20">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`
                                        w-full bg-zinc-900 border rounded-xl px-4 py-3.5 flex items-center justify-between 
                                        transition-all duration-200 shadow-sm
                                        ${isDropdownOpen ? 'border-primary-500 ring-1 ring-primary-500/30' : 'border-zinc-800 hover:border-zinc-700'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${paymentMethod ? 'bg-primary-500/10 text-primary-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className={`block font-semibold text-sm ${paymentMethod ? 'text-white' : 'text-zinc-500'}`}>
                                                {getSelectedMethodName()}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden animate-slide-up p-1.5">
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
                                                            ? 'bg-primary-500/10 text-primary-500'
                                                            : 'hover:bg-zinc-800 text-zinc-300'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-zinc-900 text-primary-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-semibold text-sm block">
                                                                {method.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {paymentMethod === method.id && (
                                                        <Check size={16} className="text-primary-500" />
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
                            className="w-full mb-10 shadow-glow"
                        >
                            Continue to Payment
                        </Button>

                        {/* Section 4: History */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <History size={18} className="text-zinc-500" />
                                <h3 className="font-bold text-zinc-300 text-sm uppercase tracking-wider">Recent Activity</h3>
                            </div>

                            {loadingHistory ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                                    <p className="text-xs text-zinc-500 font-medium">No records found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((item) => (
                                        <div key={item._id} className="bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    p-2.5 rounded-xl
                                                    ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-amber-500/10 text-amber-500'}
                                                `}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{formatNumber(item.amount)} ETB</p>
                                                    <p className="text-[10px] text-zinc-500 font-medium">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`
                                                text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                                                ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'}
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
                        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-3xl p-6 mb-6 text-center">
                            <div className="bg-zinc-900 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow text-emerald-500 border border-emerald-500/30">
                                <Check size={28} strokeWidth={3} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Request Created</h3>
                            <p className="text-emerald-400 text-sm leading-relaxed max-w-xs mx-auto">
                                Transfer exactly <span className="font-bold bg-zinc-900 border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-500">{formatNumber(selectedAmount)} ETB</span>
                            </p>
                        </div>

                        <div className="bg-zinc-900 rounded-3xl p-6 shadow-sm mb-6 border border-zinc-800">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
                                Bank Details
                            </h4>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-0.5">Bank Name</p>
                                        <p className="font-bold text-white">{methods.find(m => m.id === paymentMethod)?.name}</p>
                                    </div>

                                </div>
                                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-zinc-500 mb-0.5">Account Number</p>
                                        <p className="font-mono font-bold text-primary-500 text-lg tracking-tight truncate">
                                            {methods.find(m => m.id === paymentMethod)?.account}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(methods.find(m => m.id === paymentMethod)?.account)}
                                        className="p-2 text-primary-500 hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 mb-0.5">Account Holder</p>
                                    <p className="font-bold text-white">{methods.find(m => m.id === paymentMethod)?.holder}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <Card className="p-5 border-zinc-800 shadow-sm bg-zinc-900">
                                <label className="block text-sm font-bold text-zinc-300 mb-3 text-center">Enter Transaction FT Number</label>
                                <Input
                                    value={ftNumber}
                                    onChange={(e) => setFtNumber(e.target.value.toUpperCase())}
                                    placeholder="FT230104XXXX"
                                    maxLength={12}
                                    className="text-center font-mono tracking-widest text-lg py-3 uppercase placeholder:normal-case placeholder:tracking-normal"
                                />
                                <p className="text-[10px] text-zinc-500 mt-2 text-center">
                                    Enter the 12-digit transaction reference number from your bank app.
                                </p>
                            </Card>
                        </div>

                        <Button
                            onClick={handleSubmitFT}
                            loading={submitting}
                            disabled={submitting}
                            size="lg"
                            className="w-full mb-3 shadow-glow"
                        >
                            Submit Payment
                        </Button>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full py-3 text-zinc-500 font-bold text-sm hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
