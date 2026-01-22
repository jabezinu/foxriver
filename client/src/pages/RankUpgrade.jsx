import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI, rankUpgradeAPI, bankAPI, depositAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Zap, CheckCircle, Crown, Lock, Star, CreditCard, Check, ChevronDown, Copy, Upload, Image } from 'lucide-react';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/Modal';

export default function RankUpgrade() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [methods, setMethods] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Deposit submission states
    const [step, setStep] = useState(1); // 1: Select tier, 2: FT submission
    const [currentRequest, setCurrentRequest] = useState(null);
    const [ftNumber, setFtNumber] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tiersRes, banksRes] = await Promise.all([
                    membershipAPI.getTiers(),
                    bankAPI.getBanks()
                ]);
                
                setTiers(tiersRes.data.tiers);
                
                const bankMethods = banksRes.data.data.map(bank => ({
                    id: bank._id || bank.id,
                    name: bank.bankName,
                    account: bank.accountNumber,
                    holder: bank.accountHolderName
                }));
                setMethods(bankMethods);
            } catch (error) {
                toast.error('Failed to fetch data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isHigherLevel = (tierLevel) => {
        const levels = ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'];
        const currentIdx = levels.indexOf(user?.membershipLevel || 'Intern');
        const tierIdx = levels.indexOf(tierLevel);
        return tierIdx > currentIdx;
    };

    const handleUpgradeClick = (tier) => {
        setSelectedTier(tier);
        setShowModal(true);
    };

    const handleConfirmUpgrade = async () => {
        if (!selectedTier || !paymentMethod) {
            toast.error('Please select payment method');
            return;
        }

        setConfirmLoading(true);
        try {
            const res = await rankUpgradeAPI.createRequest({
                newLevel: selectedTier.level,
                amount: selectedTier.price,
                paymentMethod
            });

            if (res.data.success) {
                setCurrentRequest(res.data.rankUpgradeRequest);
                setShowModal(false);
                setStep(2);
                toast.success('Rank upgrade request created! Please complete the deposit.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create upgrade request');
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleSubmitFT = async () => {
        if (!ftNumber) {
            toast.error('Please enter transaction ID');
            return;
        }

        if (!screenshot) {
            toast.error('Please upload transaction screenshot');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('depositId', currentRequest.depositId);
            formData.append('transactionFT', ftNumber);
            formData.append('screenshot', screenshot);

            await depositAPI.submitFT(formData);
            toast.success('Deposit submitted! Your rank will be upgraded once approved.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit deposit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setScreenshot(file);
            setScreenshotPreview(URL.createObjectURL(file));
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
        <div className="min-h-screen bg-zinc-950 pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Rank Upgrade</h1>
            </div>

            {step === 1 ? (
                <div className="px-4 py-6 space-y-4">
                    {/* Notice */}
                    <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-lg">
                                <Crown size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-amber-400 font-bold text-sm mb-1">New Deposit Required</h3>
                                <p className="text-amber-200/80 text-xs leading-relaxed">
                                    All rank upgrades now require a new deposit. Your rank will be upgraded automatically once your deposit is approved.
                                </p>
                            </div>
                        </div>
                    </div>

                    {tiers.map((tier, index) => {
                        const isCurrent = user?.membershipLevel === tier.level;
                        const canUpgrade = isHigherLevel(tier.level);

                        return (
                            <Card
                                key={index}
                                className={`relative overflow-hidden transition-all duration-300 border-zinc-800 bg-zinc-900 ${isCurrent
                                    ? 'border-primary-500 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500'
                                    : canUpgrade
                                        ? 'hover:border-zinc-700 hover:shadow-card'
                                        : 'opacity-60 grayscale-[0.8]'
                                    }`}
                            >
                                {/* Background decoration */}
                                {isCurrent && <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 pointer-events-none blur-2xl" />}

                                <div className="p-5 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-lg ${isCurrent ? 'bg-gradient-to-br from-primary-400 to-violet-600 text-white shadow-primary-500/20' :
                                                canUpgrade ? 'bg-gradient-to-br from-zinc-800 to-zinc-950 text-white border border-zinc-700' :
                                                    'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                {tier.level}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white leading-none mb-1">
                                                    {formatNumber(tier.price)} <span className="text-xs font-bold text-zinc-500">ETB</span>
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{tier.level} Membership</p>
                                            </div>
                                        </div>

                                        {isCurrent ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary-400 uppercase bg-primary-500/10 px-2 py-1 rounded-lg border border-primary-500/20">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        ) : !canUpgrade ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700">
                                                <Lock size={12} /> Locked
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-5">
                                        <div className="bg-zinc-950 rounded-xl p-2 text-center border border-zinc-800">
                                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Daily Limit</p>
                                            <p className="font-black text-zinc-300 text-sm">{tier.dailyTasks} <span className="text-[9px] font-medium text-zinc-600">Tasks</span></p>
                                        </div>
                                        <div className="bg-zinc-950 rounded-xl p-2 text-center border border-zinc-800">
                                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Per Video</p>
                                            <p className="font-black text-primary-500 text-sm">{formatNumber(tier.perVideoIncome.toFixed(0))}</p>
                                        </div>
                                        <div className="bg-zinc-950 rounded-xl p-2 text-center border border-zinc-800">
                                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Daily Income</p>
                                            <p className="font-black text-emerald-400 text-sm">{formatNumber(tier.dailyIncome.toFixed(0))}</p>
                                        </div>
                                    </div>

                                    {canUpgrade ? (
                                        <Button
                                            onClick={() => handleUpgradeClick(tier)}
                                            className="w-full shadow-glow bg-primary-500 hover:bg-primary-600 text-black font-bold"
                                        >
                                            <Zap size={16} className="mr-2 fill-black text-black" />
                                            Upgrade with Deposit
                                        </Button>
                                    ) : isCurrent ? (
                                        <div className="w-full py-3 bg-primary-500/10 text-primary-500 rounded-xl font-bold text-center border border-primary-500/20 text-xs flex items-center justify-center gap-2">
                                            <CheckCircle size={14} />
                                            Current Active Plan
                                        </div>
                                    ) : (
                                        <Button
                                            disabled
                                            variant="secondary"
                                            className="w-full opacity-50 bg-zinc-800 text-zinc-500"
                                        >
                                            Combined with Lower Tier
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="max-w-md mx-auto px-4 py-6 animate-slide-up">
                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-3xl p-6 mb-6 text-center">
                        <div className="bg-zinc-900 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow text-emerald-500 border border-emerald-500/30">
                            <Check size={28} strokeWidth={3} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Upgrade Request Created</h3>
                        <p className="text-emerald-400 text-sm leading-relaxed max-w-xs mx-auto">
                            Deposit exactly <span className="font-bold bg-zinc-900 border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-500">{formatNumber(selectedTier?.price)} ETB</span> to upgrade to {selectedTier?.level}
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
                            <label className="block text-sm font-bold text-zinc-300 mb-3 text-center">Enter Transaction ID</label>
                            <Input
                                value={ftNumber}
                                onChange={(e) => setFtNumber(e.target.value.toUpperCase())}
                                placeholder="Enter transaction ID"
                                className="text-center font-mono tracking-widest text-lg py-3 uppercase placeholder:normal-case placeholder:tracking-normal"
                            />
                            <p className="text-[10px] text-zinc-500 mt-2 text-center">
                                Enter the transaction reference number from your bank app.
                            </p>
                        </Card>
                    </div>

                    <div className="mb-8">
                        <Card className="p-5 border-zinc-800 shadow-sm bg-zinc-900">
                            <label className="block text-sm font-bold text-zinc-300 mb-3 text-center">Upload Transaction Screenshot</label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                className="hidden"
                                id="screenshot-upload"
                            />

                            {screenshotPreview ? (
                                <div className="relative">
                                    <img
                                        src={screenshotPreview}
                                        alt="Transaction screenshot"
                                        className="w-full rounded-xl border-2 border-zinc-800 mb-3"
                                    />
                                    <button
                                        onClick={() => {
                                            setScreenshot(null);
                                            setScreenshotPreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="screenshot-upload"
                                    className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-8 cursor-pointer hover:border-primary-500 transition-colors"
                                >
                                    <Image size={40} className="text-zinc-600 mb-2" />
                                    <span className="text-sm font-bold text-zinc-400">Click to upload screenshot</span>
                                    <span className="text-xs text-zinc-600 mt-1">PNG, JPG, GIF up to 5MB</span>
                                </label>
                            )}

                            <p className="text-[10px] text-zinc-500 mt-2 text-center">
                                Upload a clear screenshot of your transaction confirmation.
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
                        Submit Deposit
                    </Button>

                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-3 text-zinc-500 font-bold text-sm hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Upgrade Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedTier ? `Upgrade to ${selectedTier.level}` : 'Confirm Upgrade'}
            >
                {selectedTier && (
                    <div className="space-y-5">
                        <div className="bg-zinc-950 text-white p-4 rounded-xl shadow-lg flex justify-between items-center border border-zinc-800">
                            <span className="text-sm font-medium text-zinc-400">Deposit Required</span>
                            <span className="text-xl font-black text-primary-500">{formatNumber(selectedTier.price)} ETB</span>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Payment Method</label>

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

                        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-amber-200 text-xs leading-relaxed">
                                <strong>Important:</strong> Your rank will be upgraded automatically once your deposit is approved by our admin team. This process typically takes a few hours.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmUpgrade}
                                loading={confirmLoading}
                                disabled={confirmLoading || !paymentMethod}
                                className="flex-[2] shadow-glow"
                            >
                                Create Upgrade Request
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}