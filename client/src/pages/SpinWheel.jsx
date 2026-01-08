import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { spinAPI } from '../services/api';

const SpinWheel = () => {
    const [spinning, setSpinning] = useState(false);
    const [personalBalance, setPersonalBalance] = useState(0);
    const [incomeBalance, setIncomeBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [reels, setReels] = useState([0, 0, 0]);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);

    // Slot machine symbols - 50 different symbols
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
    }, []);

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
        // Check if user has sufficient balance in either wallet
        if (personalBalance < 10 && incomeBalance < 10) {
            toast.error('Insufficient balance! You need 10 ETB to play.');
            return;
        }
        
        // Show wallet selection modal
        setShowWalletModal(true);
    };

    const handleWalletSelect = (wallet) => {
        const balance = wallet === 'personal' ? personalBalance : incomeBalance;
        
        if (balance < 10) {
            toast.error(`Insufficient ${wallet} balance! You need 10 ETB to play.`);
            return;
        }
        
        setSelectedWallet(wallet);
        setShowWalletModal(false);
        handleSpin(wallet);
    };

    const handleSpin = async (walletType) => {
        if (spinning) return;

        setSpinning(true);
        setShowResult(false);

        try {
            const response = await spinAPI.spin({ walletType });
            const { result, amountWon, balanceAfter } = response.data.data;

            // Animate reels spinning
            const spinDuration = 2000; // 2 seconds
            const spinInterval = 50; // Update every 50ms
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
                    
                    // Set final result
                    if (result === 'Win 100 ETB') {
                        // All three reels show the same symbol
                        const winningSymbol = Math.floor(Math.random() * symbols.length);
                        setReels([winningSymbol, winningSymbol, winningSymbol]);
                    } else {
                        // Show different symbols (no match)
                        const reel1 = Math.floor(Math.random() * symbols.length);
                        let reel2 = Math.floor(Math.random() * symbols.length);
                        let reel3 = Math.floor(Math.random() * symbols.length);
                        
                        // Ensure they don't all match
                        while (reel2 === reel1) reel2 = Math.floor(Math.random() * symbols.length);
                        while (reel3 === reel1 || reel3 === reel2) reel3 = Math.floor(Math.random() * symbols.length);
                        
                        setReels([reel1, reel2, reel3]);
                    }

                    // Show result after a brief delay
                    setTimeout(() => {
                        setLastResult({ result, amountWon, balanceAfter });
                        
                        // Update the correct balance
                        if (selectedWallet === 'personal') {
                            setPersonalBalance(balanceAfter);
                        } else {
                            setIncomeBalance(balanceAfter);
                        }
                        
                        setShowResult(true);
                        setSpinning(false);
                        
                        if (result === 'Win 100 ETB') {
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
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-6">
                    <h1 className="text-5xl font-bold text-white mb-2">🎰 Slot Machine</h1>
                    <p className="text-gray-300">Pay 10 ETB per play • Match 3 symbols to win 100 ETB!</p>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                        <p className="text-gray-300 mb-2">💰 Personal Balance</p>
                        <p className="text-3xl font-bold text-yellow-400">{personalBalance.toFixed(2)} ETB</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                        <p className="text-gray-300 mb-2">💵 Income Balance</p>
                        <p className="text-3xl font-bold text-green-400">{incomeBalance.toFixed(2)} ETB</p>
                    </div>
                </div>

                {/* Slot Machine Container */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    {/* Slot Machine */}
                    <div className="flex-1 flex flex-col items-center">
                        {/* Slot Machine Frame */}
                        <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-3xl p-8 shadow-2xl border-8 border-yellow-700">
                            {/* Title */}
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-white drop-shadow-lg">LUCKY 777</h2>
                                <p className="text-yellow-200 text-sm mt-1">Match 3 to Win!</p>
                            </div>

                            {/* Reels Container */}
                            <div className="bg-black/50 rounded-2xl p-6 mb-6">
                                <div className="flex gap-4 justify-center">
                                    {/* Reel 1 */}
                                    <div className="bg-white rounded-xl shadow-inner p-4 w-28 h-32 flex items-center justify-center border-4 border-gray-300">
                                        <span className={`text-7xl transition-all duration-100 ${spinning ? 'blur-sm' : ''}`}>
                                            {symbols[reels[0]]}
                                        </span>
                                    </div>
                                    
                                    {/* Reel 2 */}
                                    <div className="bg-white rounded-xl shadow-inner p-4 w-28 h-32 flex items-center justify-center border-4 border-gray-300">
                                        <span className={`text-7xl transition-all duration-100 ${spinning ? 'blur-sm' : ''}`}>
                                            {symbols[reels[1]]}
                                        </span>
                                    </div>
                                    
                                    {/* Reel 3 */}
                                    <div className="bg-white rounded-xl shadow-inner p-4 w-28 h-32 flex items-center justify-center border-4 border-gray-300">
                                        <span className={`text-7xl transition-all duration-100 ${spinning ? 'blur-sm' : ''}`}>
                                            {symbols[reels[2]]}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Symbol Legend */}
                            {/* <div className="bg-black/30 rounded-xl p-4 mb-4">
                                <p className="text-yellow-200 text-center text-sm mb-2 font-semibold">Symbols:</p>
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {symbols.map((symbol, idx) => (
                                        <span key={idx} className="text-2xl bg-white/20 rounded-lg px-2 py-1">
                                            {symbol}
                                        </span>
                                    ))}
                                </div>
                            </div> */}

                            {/* Play Button */}
                            <button
                                onClick={handlePlayClick}
                                disabled={spinning || (personalBalance < 10 && incomeBalance < 10)}
                                className={`w-full py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
                                    spinning || (personalBalance < 10 && incomeBalance < 10)
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-lg'
                                } text-white`}
                            >
                                {spinning ? '🎰 SPINNING...' : '🎮 PLAY (10 ETB)'}
                            </button>
                        </div>

                        {/* Result Modal */}
                        {showResult && lastResult && (
                            <div className="mt-6 bg-white/20 backdrop-blur-md rounded-xl p-6 text-center animate-pulse">
                                <p className="text-3xl font-bold text-white mb-2">
                                    {lastResult.result === 'Win 100 ETB' ? '🎉 JACKPOT!' : '❌ No Match'}
                                </p>
                                {lastResult.amountWon > 0 ? (
                                    <p className="text-4xl font-bold text-yellow-400">
                                        +{lastResult.amountWon} ETB
                                    </p>
                                ) : (
                                    <p className="text-xl text-gray-300">Try Again!</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats & History */}
                    <div className="flex-1 space-y-6">
                        {/* Stats */}
                        {stats && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">📊 Your Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-gray-300 text-sm">Total Plays</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalSpins}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-gray-300 text-sm">Jackpots</p>
                                        <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-gray-300 text-sm">Total Paid</p>
                                        <p className="text-2xl font-bold text-red-400">{stats.totalPaid} ETB</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-gray-300 text-sm">Total Won</p>
                                        <p className="text-2xl font-bold text-yellow-400">{stats.totalWon} ETB</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent History */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">📜 Recent Plays</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {history.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No plays yet</p>
                                ) : (
                                    history.map((spin) => (
                                        <div
                                            key={spin._id}
                                            className="bg-white/10 rounded-lg p-3 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className={`font-semibold ${
                                                    spin.result === 'Win 100 ETB' ? 'text-yellow-400' : 'text-gray-300'
                                                }`}>
                                                    {spin.result === 'Win 100 ETB' ? '🎰 JACKPOT!' : '❌ No Match'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(spin.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${
                                                    spin.amountWon > 0 ? 'text-green-400' : 'text-red-400'
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
                </div>

                {/* Wallet Selection Modal */}
                {showWalletModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-purple-500/50">
                            <h2 className="text-3xl font-bold text-white mb-2 text-center">💰 Choose Wallet</h2>
                            <p className="text-gray-300 text-center mb-6">Select which balance to use for playing</p>
                            
                            <div className="space-y-4">
                                {/* Personal Wallet Option */}
                                <button
                                    onClick={() => handleWalletSelect('personal')}
                                    disabled={personalBalance < 10}
                                    className={`w-full p-6 rounded-xl transition-all transform hover:scale-105 ${
                                        personalBalance < 10
                                            ? 'bg-gray-600/50 cursor-not-allowed opacity-50'
                                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-white font-bold text-xl">💰 Personal Balance</p>
                                            <p className="text-yellow-100 text-sm mt-1">Use your personal wallet</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-2xl">{personalBalance.toFixed(2)}</p>
                                            <p className="text-yellow-100 text-sm">ETB</p>
                                        </div>
                                    </div>
                                </button>

                                {/* Income Wallet Option */}
                                <button
                                    onClick={() => handleWalletSelect('income')}
                                    disabled={incomeBalance < 10}
                                    className={`w-full p-6 rounded-xl transition-all transform hover:scale-105 ${
                                        incomeBalance < 10
                                            ? 'bg-gray-600/50 cursor-not-allowed opacity-50'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-white font-bold text-xl">💵 Income Balance</p>
                                            <p className="text-green-100 text-sm mt-1">Use your income wallet</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-2xl">{incomeBalance.toFixed(2)}</p>
                                            <p className="text-green-100 text-sm">ETB</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Cancel Button */}
                            <button
                                onClick={() => setShowWalletModal(false)}
                                className="w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpinWheel;
