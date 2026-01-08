import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { spinAPI } from '../services/api';

const SpinWheel = () => {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    // Wheel segments (10 total: 9 "Try Again", 1 "Win 100 ETB")
    const segments = [
        { label: 'Try Again', color: '#ef4444' },
        { label: 'Try Again', color: '#f59e0b' },
        { label: 'Try Again', color: '#10b981' },
        { label: 'Try Again', color: '#3b82f6' },
        { label: 'Try Again', color: '#8b5cf6' },
        { label: 'Win 100 ETB', color: '#fbbf24' }, // The winning segment
        { label: 'Try Again', color: '#ec4899' },
        { label: 'Try Again', color: '#14b8a6' },
        { label: 'Try Again', color: '#f97316' },
        { label: 'Try Again', color: '#6366f1' }
    ];

    useEffect(() => {
        fetchBalance();
        fetchHistory();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await spinAPI.getBalance();
            setBalance(response.data.wallet.personalWallet);
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

    const handleSpin = async () => {
        if (spinning) return;

        if (balance < 10) {
            toast.error('Insufficient balance! You need 10 ETB to spin.');
            return;
        }

        setSpinning(true);
        setShowResult(false);

        try {
            const response = await spinAPI.spin();
            const { result, amountWon, balanceAfter } = response.data.data;

            // Determine which segment was hit
            const winningIndex = result === 'Win 100 ETB' ? 5 : 
                [0, 1, 2, 3, 4, 6, 7, 8, 9][Math.floor(Math.random() * 9)];

            // Calculate rotation (multiple full spins + landing position)
            const segmentAngle = 360 / segments.length;
            const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
            const spins = 5; // Number of full rotations
            const finalRotation = rotation + (spins * 360) + targetAngle;

            setRotation(finalRotation);

            // Wait for animation to complete
            setTimeout(() => {
                setLastResult({ result, amountWon, balanceAfter });
                setBalance(balanceAfter);
                setShowResult(true);
                setSpinning(false);
                
                if (result === 'Win 100 ETB') {
                    toast.success(`🎉 Congratulations! You won ${amountWon} ETB!`);
                } else {
                    toast.error('Try Again! Better luck next time.');
                }

                fetchHistory();
                fetchBalance();
            }, 4000);

        } catch (error) {
            setSpinning(false);
            toast.error(error.response?.data?.message || 'Error spinning the wheel');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-6">
                    <h1 className="text-4xl font-bold text-white mb-2">🎡 Spin the Wheel</h1>
                    <p className="text-gray-300">Pay 10 ETB per spin • Win up to 100 ETB!</p>
                </div>

                {/* Balance Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 text-center">
                    <p className="text-gray-300 mb-2">Your Balance</p>
                    <p className="text-4xl font-bold text-yellow-400">{balance.toFixed(2)} ETB</p>
                </div>

                {/* Wheel Container */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    {/* Wheel */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="relative w-full max-w-md aspect-square">
                            {/* Pointer */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg"></div>
                            </div>

                            {/* Wheel */}
                            <div className="relative w-full h-full">
                                <div 
                                    className="absolute inset-0 rounded-full shadow-2xl transition-transform duration-[4000ms] ease-out"
                                    style={{ 
                                        transform: `rotate(${rotation}deg)`,
                                        background: `conic-gradient(${segments.map((seg, i) => 
                                            `${seg.color} ${(i * 36)}deg ${((i + 1) * 36)}deg`
                                        ).join(', ')})`
                                    }}
                                >
                                    {/* Center circle */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                            <span className="text-2xl">🎰</span>
                                        </div>
                                    </div>

                                    {/* Segment labels */}
                                    {segments.map((segment, index) => {
                                        const angle = (index * 36) + 18;
                                        const radius = 40;
                                        return (
                                            <div
                                                key={index}
                                                className="absolute top-1/2 left-1/2 origin-left text-white font-bold text-xs"
                                                style={{
                                                    transform: `rotate(${angle}deg) translateX(${radius}%)`,
                                                    width: '60%'
                                                }}
                                            >
                                                <span className="block whitespace-nowrap">
                                                    {segment.label === 'Win 100 ETB' ? '💰 100 ETB' : '❌'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Spin Button */}
                        <button
                            onClick={handleSpin}
                            disabled={spinning || balance < 10}
                            className={`mt-8 px-12 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 ${
                                spinning || balance < 10
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg'
                            } text-white`}
                        >
                            {spinning ? '🎡 Spinning...' : '🎰 SPIN (10 ETB)'}
                        </button>

                        {/* Result Modal */}
                        {showResult && lastResult && (
                            <div className="mt-6 bg-white/20 backdrop-blur-md rounded-xl p-6 text-center animate-bounce">
                                <p className="text-2xl font-bold text-white mb-2">
                                    {lastResult.result === 'Win 100 ETB' ? '🎉 YOU WON!' : '😔 Try Again'}
                                </p>
                                {lastResult.amountWon > 0 && (
                                    <p className="text-3xl font-bold text-yellow-400">
                                        +{lastResult.amountWon} ETB
                                    </p>
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
                                        <p className="text-gray-300 text-sm">Total Spins</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalSpins}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-gray-300 text-sm">Wins</p>
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
                            <h3 className="text-xl font-bold text-white mb-4">📜 Recent Spins</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {history.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No spins yet</p>
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
                                                    {spin.result === 'Win 100 ETB' ? '🎉 Won 100 ETB' : '❌ Try Again'}
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
            </div>
        </div>
    );
};

export default SpinWheel;
