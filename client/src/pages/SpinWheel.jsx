import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { spinAPI } from '../services/api';
import { ArrowLeft, TrendingUp, Trophy, Zap, Sparkles } from 'lucide-react';

const SpinWheel = () => {
    const navigate = useNavigate();
    const [spinning, setSpinning] = useState(false);
    const [personalBalance, setPersonalBalance] = useState(0);
    const [incomeBalance, setIncomeBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [reels, setReels] = useState([0, 0, 0]);
    const [showTierModal, setShowTierModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [tiers, setTiers] = useState([]);

    // Slot machine symbols
    const symbols = [
        '🍒', '🍋', '🍊', '🍇', '🍉', '🍓', '🍑', '🍍', '🥝', '🍌',
        '🍎', '🍏', '🍐', '🥭', '🍈', '🫐', '🥥', '🍅', '🌶️', '🥕',
        '🌽', '🥦', '🥒', '🥬', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞',
        '🥐', '🥖', '🥨', '🧀', '🥚', '🍗', '🍖', '🥩', '🍕', '🍔',
        '🌭', '🥪', '🌮', '🌯', '🥙', '🍱', '🍜', '🍲', '🍛', '🍣'
    ];

    useEffect(() => {
        fetchBalance();
        fetchHistory();
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const response = await fetch('http://localhost:5002/api/slot-tiers');
            const data = await response.json();
            if (data.success) {
                setTiers(data.data);
            }
        } catch (error) {
            console.error('Error fetching tiers:', error);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await spinAPI.getBalance();
            setPersonalBalance(response.data.wallet.personalWallet);
            setIncomeBalance(response.data.wallet.incomeWallet);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await spinAPI.getHistory();
            setHistory(response.data.data.spins);
            setStats(response.data.data.stats);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handlePlayClick = () => {
        setShowTierModal(true);
    };

    const handleTierSelect = (tier) => {
        if (personalBalance < tier.betAmount && incomeBalance < tier.betAmount) {
            toast.error(`Insufficient balance! You need ${tier.betAmount} ETB to play this tier.`);
            return;
        }
        
        setSelectedTier(tier);
        setShowTierModal(false);
        setShowWalletModal(true);
    };

    const handleWalletSelect = (wallet) => {
        const balance = wallet === 'personal' ? personalBalance : incomeBalance;
        
        if (balance < selectedTier.betAmount) {
            toast.error(`Insufficient ${wallet} balance! You need ${selectedTier.betAmount} ETB to play.`);
            return;
        }
        
        setSelectedWallet(wallet);
        setShowWalletModal(false);
        handleSpin(wallet, selectedTier);
    };

    const handleSpin = async (walletType, tier) => {
        if (spinning) return;

        setSpinning(true);
        setShowResult(false);

        try {
            const response = await spinAPI.spin({ walletType, tierId: tier._id });
            const { result, amountWon, balanceAfter, incomeBalanceAfter } = response.data.data;

            const spinDuration = 2000;
            const spinInterval = 50;
            const spinCount = spinDuration / spinInterval;
            let currentSpin = 0;

            const spinAnimation = setInterval(() => {
                setReels([
                    Math.floor(Math.random() * symbols.length),
                    Math.floor(Math.random() * symbols.length),
                    Math.floor(Math.random() * symbols.length)
                ]);
                currentSpin++;

                if (currentSpin >= spinCount) {
                    clearInterval(spinAnimation);
                    
                    if (result.includes('Win')) {
                        const winningSymbol = Math.floor(Math.random() * symbols.length);
                        setReels([winningSymbol, winningSymbol, winningSymbol]);
                    } else {
                        const reel1 = Math.floor(Math.random() * symbols.length);
                        let reel2 = Math.floor(Math.random() * symbols.length);
                        let reel3 = Math.floor(Math.random() * symbols.length);
                        
                        while (reel2 === reel1) reel2 = Math.floor(Math.random() * symbols.length);
                        while (reel3 === reel1 || reel3 === reel2) reel3 = Math.floor(Math.random() * symbols.length);
                        
                        setReels([reel1, reel2, reel3]);
                    }

                    setTimeout(() => {
                        setLastResult({ result, amountWon, balanceAfter });
                        
                        if (selectedWallet === 'personal') {
                            setPersonalBalance(balanceAfter);
                        } else {
                            setIncomeBalance(balanceAfter);
                        }
                        
                        if (amountWon > 0 && incomeBalanceAfter) {
                            setIncomeBalance(incomeBalanceAfter);
                        }
                        
                        setShowResult(true);
                        setSpinning(false);
                        
                        if (result.includes('Win')) {
                            toast.success(`🎉 JACKPOT! You won ${amountWon} ETB!`);
                        } else {
                            toast.error('No match! Try again!');
                        }

                        fetchHistory();
                        fetchBalance();
                    }, 500);
                }
            }, spinInterval);

        } catch (error) {
            setSpinning(false);
            toast.error(error.response?.data?.message || 'Error playing slot machine');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-6">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <div>
                    <h1 className="font-bold text-white text-lg">Slot Machine</h1>
                    <p className="text-xs text-zinc-400">Match 3 symbols to win!</p>
                </div>
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-4">
                        <p className="text-xs text-emerald-400 mb-1 font-semibold">Personal Balance</p>
                        <p className="text-2xl font-bold text-white">{personalBalance.toFixed(2)} <span className="text-sm text-zinc-400">ETB</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-4">
                        <p className="text-xs text-blue-400 mb-1 font-semibold">Income Balance</p>
                        <p className="text-2xl font-bold text-white">{incomeBalance.toFixed(2)} <span className="text-sm text-zinc-400">ETB</span></p>
                    </div>
                </div>

                {/* Slot Machine */}
                <div className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-yellow-500/10 border border-pink-500/20 rounded-3xl p-6 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-2 right-4 text-yellow-400 animate-pulse">
                        <Sparkles size={20} />
                    </div>
                    <div className="absolute bottom-3 left-6 text-pink-400 animate-pulse delay-150">
                        <Sparkles size={16} />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="text-yellow-400" size={24} />
                            <h2 className="text-2xl font-black text-white">LUCKY SPIN</h2>
                            <Trophy className="text-yellow-400" size={24} />
                        </div>
                        <p className="text-zinc-400 text-sm">Match 3 symbols to win big!</p>
                    </div>

                    {/* Reels */}
                    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-zinc-800">
                        <div className="flex gap-3 justify-center">
                            {[0, 1, 2].map((index) => (
                                <div key={index} className="bg-zinc-950 rounded-xl shadow-lg p-4 w-24 h-28 flex items-center justify-center border-2 border-zinc-800">
                                    <span className={`text-6xl transition-all duration-100 ${spinning ? 'blur-sm scale-110' : 'scale-100'}`}>
                                        {symbols[reels[index]]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Play Button */}
                    <button
                        onClick={handlePlayClick}
                        disabled={spinning || tiers.length === 0}
                        className={`w-full py-4 rounded-xl text-lg font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                            spinning || tiers.length === 0
                                ? 'bg-zinc-700 cursor-not-allowed text-zinc-400'
                                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:shadow-lg hover:shadow-pink-500/50 text-white'
                        }`}
                    >
                        {spinning ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                SPINNING...
                            </>
                        ) : tiers.length === 0 ? (
                            'No Tiers Available'
                        ) : (
                            <>
                                <Zap size={20} />
                                PLAY NOW
                            </>
                        )}
                    </button>

                    {/* Result Display */}
                    {showResult && lastResult && (
                        <div className="mt-4 bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 text-center border border-zinc-800 animate-fadeIn">
                            <p className={`text-xl font-bold mb-1 ${lastResult.amountWon > 0 ? 'text-yellow-400' : 'text-zinc-400'}`}>
                                {lastResult.amountWon > 0 ? '🎉 JACKPOT!' : '❌ No Match'}
                            </p>
                            {lastResult.amountWon > 0 && (
                                <p className="text-2xl font-black text-yellow-400">
                                    +{lastResult.amountWon} ETB
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats */}
                {stats && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-primary-500" />
                            <h3 className="text-lg font-bold text-white">Your Stats</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                <p className="text-xs text-zinc-400 mb-1">Total Plays</p>
                                <p className="text-2xl font-bold text-white">{stats.totalSpins}</p>
                            </div>
                            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                <p className="text-xs text-zinc-400 mb-1">Jackpots</p>
                                <p className="text-2xl font-bold text-emerald-400">{stats.wins}</p>
                            </div>
                            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                <p className="text-xs text-zinc-400 mb-1">Total Paid</p>
                                <p className="text-xl font-bold text-red-400">{stats.totalPaid} ETB</p>
                            </div>
                            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                <p className="text-xs text-zinc-400 mb-1">Total Won</p>
                                <p className="text-xl font-bold text-yellow-400">{stats.totalWon} ETB</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent History */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Plays</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {history.length === 0 ? (
                            <p className="text-zinc-500 text-center py-8 text-sm">No plays yet. Start spinning!</p>
                        ) : (
                            history.map((spin) => (
                                <div
                                    key={spin._id}
                                    className="bg-zinc-950 rounded-xl p-3 flex justify-between items-center border border-zinc-800"
                                >
                                    <div>
                                        <p className={`font-semibold text-sm ${
                                            spin.result.includes('Win') ? 'text-yellow-400' : 'text-zinc-400'
                                        }`}>
                                            {spin.result.includes('Win') ? '🎰 JACKPOT!' : '❌ No Match'}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {new Date(spin.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${
                                            spin.amountWon > 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            {spin.amountWon > 0 ? `+${spin.amountWon}` : `-${spin.amountPaid}`} ETB
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Tier Selection Modal */}
            {showTierModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-white mb-1">Choose Your Bet</h2>
                            <p className="text-zinc-400 text-sm">Select a tier to start playing</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {tiers.map((tier) => (
                                <button
                                    key={tier._id}
                                    onClick={() => handleTierSelect(tier)}
                                    disabled={personalBalance < tier.betAmount && incomeBalance < tier.betAmount}
                                    className={`p-5 rounded-2xl transition-all transform active:scale-95 text-left border-2 ${
                                        personalBalance < tier.betAmount && incomeBalance < tier.betAmount
                                            ? 'bg-zinc-800/50 border-zinc-700 cursor-not-allowed opacity-50'
                                            : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20'
                                    }`}
                                >
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-400 text-sm">Bet Amount:</span>
                                            <span className="text-white font-bold">{tier.betAmount} ETB</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-400 text-sm">Win Amount:</span>
                                            <span className="text-yellow-400 font-bold text-lg">{tier.winAmount} ETB</span>
                                        </div>
                                    </div>
                                    
                                    {tier.description && (
                                        <p className="text-zinc-500 text-xs mt-3">{tier.description}</p>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowTierModal(false)}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Wallet Selection Modal */}
            {showWalletModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-800">
                        <div className="text-center mb-2">
                            <h2 className="text-2xl font-black text-white mb-1">Choose Wallet</h2>
                            <p className="text-zinc-400 text-sm">Select which balance to use</p>
                        </div>
                        {selectedTier && (
                            <div className="bg-zinc-950 rounded-xl p-3 mb-4 border border-zinc-800">
                                <p className="text-yellow-400 text-center font-semibold text-sm">
                                    {selectedTier.name}: Bet {selectedTier.betAmount} ETB • Win {selectedTier.winAmount} ETB
                                </p>
                            </div>
                        )}
                        
                        <div className="space-y-3 mb-4">
                            <button
                                onClick={() => handleWalletSelect('personal')}
                                disabled={!selectedTier || personalBalance < selectedTier.betAmount}
                                className={`w-full p-5 rounded-2xl transition-all transform active:scale-95 border-2 ${
                                    !selectedTier || personalBalance < selectedTier.betAmount
                                        ? 'bg-zinc-800/50 border-zinc-700 cursor-not-allowed opacity-50'
                                        : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-white font-bold">Personal Balance</p>
                                        <p className="text-emerald-400 text-xs mt-0.5">Use personal wallet</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-xl">{personalBalance.toFixed(2)}</p>
                                        <p className="text-zinc-400 text-xs">ETB</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleWalletSelect('income')}
                                disabled={!selectedTier || incomeBalance < selectedTier.betAmount}
                                className={`w-full p-5 rounded-2xl transition-all transform active:scale-95 border-2 ${
                                    !selectedTier || incomeBalance < selectedTier.betAmount
                                        ? 'bg-zinc-800/50 border-zinc-700 cursor-not-allowed opacity-50'
                                        : 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-white font-bold">Income Balance</p>
                                        <p className="text-blue-400 text-xs mt-0.5">Use income wallet</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-xl">{incomeBalance.toFixed(2)}</p>
                                        <p className="text-zinc-400 text-xs">ETB</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowWalletModal(false)}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpinWheel;
