import { useState, useEffect } from 'react';
import { adminStatsAPI } from '../services/api';
import {
    HiUsers, HiCurrencyDollar, HiCheckCircle, HiBriefcase,
    HiVideoCamera, HiTrendingUp, HiTrendingDown
} from 'react-icons/hi';
import { formatNumber } from '../utils/formatNumber';
import { toast } from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await adminStatsAPI.getStats();
            setStats(res.data.stats);
        } catch (error) {
            toast.error('Failed to load dashboard statistics');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Initializing Dashboard...</div>;

    const statCards = [
        { label: 'Total Users', value: formatNumber(stats.users.total), icon: HiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Deposit Requests', value: formatNumber(stats.deposits.pending), icon: HiCurrencyDollar, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Withdrawal Requests', value: formatNumber(stats.withdrawals.pending), icon: HiBriefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Revenue (Total Approved)', value: `${formatNumber(stats.deposits.totalAmount)} ETB`, icon: HiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    // Chart Data
    const userLevelData = {
        labels: stats.users.byLevel.map(l => l.membershipLevel),
        datasets: [{
            label: 'Users by Level',
            data: stats.users.byLevel.map(l => l.count),
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#f97316'],
            borderWidth: 0,
        }]
    };

    const depositStatusData = {
        labels: ['Pending', 'Approved'],
        datasets: [{
            data: [stats.deposits.pending, stats.deposits.approved],
            backgroundColor: ['#f59e0b', '#10b981'],
            hoverOffset: 4
        }]
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500">Real-time system health and user analytics.</p>
                </div>
                <button onClick={fetchStats} className="admin-btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-wider w-full md:w-auto justify-center">
                    <HiTrendingUp />
                    Refresh Stats
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <div key={idx} className="admin-card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                            <card.icon className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                            <p className="text-xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="admin-card">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">User Membership Distribution</h3>
                    <div className="h-64">
                        <Bar
                            data={userLevelData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                            }}
                        />
                    </div>
                </div>

                <div className="admin-card">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Deposit Performance</h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut
                            data={depositStatusData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="admin-card">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Newly Registered Personnel</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header">Phone</th>
                                <th className="table-header">Level</th>
                                <th className="table-header">Registration Date</th>
                                <th className="table-header">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentUsers.map((user) => (
                                <tr key={user.id} className="table-row">
                                    <td className="px-4 py-4 text-sm font-bold text-gray-800 tracking-tight">{user.phone}</td>
                                    <td className="px-4 py-4">
                                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                            {user.membershipLevel}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-500">{new Date(user.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-4">
                                        <span className="status-badge bg-green-100 text-green-700">Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
