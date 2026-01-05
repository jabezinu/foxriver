import { useState, useEffect } from 'react';
import { adminReferralAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiCurrencyDollar, HiUserGroup, HiTrendingUp, HiSearch } from 'react-icons/hi';
import Loading from '../components/Loading';

export default function Commissions() {
    const [loading, setLoading] = useState(true);
    const [commissions, setCommissions] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            const res = await adminReferralAPI.getCommissions();
            setCommissions(res.data.commissions);
        } catch (error) {
            toast.error('Failed to fetch commissions');
        } finally {
            setLoading(false);
        }
    };

    const filteredCommissions = commissions.filter(c =>
        c.user?.phone?.includes(search) ||
        c.downlineUser?.phone?.includes(search) ||
        c.level?.includes(search)
    );

    const totalEarned = commissions.reduce((sum, c) => sum + c.amountEarned, 0);

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Referral Commissions</h1>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
                    <HiSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search phone or level..."
                        className="outline-none text-sm w-48"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <HiCurrencyDollar className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Total Paid</p>
                            <h3 className="text-2xl font-bold">{totalEarned.toLocaleString()} ETB</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <HiUserGroup className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Total Transactions</p>
                            <h3 className="text-2xl font-bold">{commissions.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <HiTrendingUp className="text-2xl text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Today's Commissions</p>
                            <h3 className="text-2xl font-bold">
                                {commissions.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString())
                                    .reduce((sum, c) => sum + c.amountEarned, 0).toLocaleString()} ETB
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                <th className="px-6 py-4">Inviter (Earnings)</th>
                                <th className="px-6 py-4">Invitee (Source)</th>
                                <th className="px-6 py-4">Level</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {filteredCommissions.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800">{c.user?.phone}</p>
                                        <p className="text-xs text-gray-500">Level: {c.user?.membershipLevel}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800">{c.downlineUser?.phone}</p>
                                        <p className="text-xs text-blue-500">{c.sourceMembership || 'Task Completion'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${c.level === 'A' ? 'bg-green-100 text-green-700' :
                                                c.level === 'B' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                            }`}>
                                            Level {c.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-bold">
                                        +{c.amountEarned.toLocaleString()} ETB
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredCommissions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                        No commissions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
