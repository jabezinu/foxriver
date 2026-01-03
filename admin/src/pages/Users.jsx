import { useState, useEffect } from 'react';
import { adminUserAPI } from '../services/api';
import { HiSearch, HiIdentification, HiExternalLink } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading'; // Need to create/link shared loading

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [filterLevel]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminUserAPI.getAllUsers({
                membershipLevel: filterLevel || undefined,
                search: searchTerm || undefined
            });
            setUsers(res.data.users);
        } catch (error) {
            toast.error('Failed to load operative data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Personnel Database</h1>
                    <p className="text-sm text-gray-500">Monitor and manage all system operatives.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="admin-card mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search by phone number (+251...)"
                            className="admin-input pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <select
                        className="admin-input md:w-48"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="">All Tiers</option>
                        {['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'].map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <button onClick={fetchUsers} className="admin-btn-primary px-8">Filter</button>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">Scanning Database...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header">Operative ID</th>
                                <th className="table-header">Tier</th>
                                <th className="table-header">Income Wallet</th>
                                <th className="table-header">Personal Wallet</th>
                                <th className="table-header">Joined Date</th>
                                <th className="table-header text-center">Security Clear</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="table-row">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                <HiIdentification />
                                            </div>
                                            <span className="font-bold text-gray-800 tracking-tight">{user.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase w-fit mb-1">
                                                {user.membershipLevel}
                                            </span>
                                            {user.bankAccount?.isSet ? (
                                                <div className="text-[9px] text-gray-400 font-bold uppercase">
                                                    {user.bankAccount.bankName} • {user.bankAccount.accountNumber.slice(-4)}
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-red-300 font-bold uppercase italic">No Bank linked</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">{user.incomeWallet} ETB</td>
                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{user.personalWallet} ETB</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="group relative">
                                            <button className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50">
                                                <HiExternalLink className="text-xl" />
                                            </button>
                                            {user.bankAccount?.isSet && (
                                                <div className="absolute right-full bottom-0 mb-2 mr-2 hidden group-hover:block bg-gray-900 text-white p-3 rounded-xl shadow-xl z-20 min-w-[200px] text-left border border-gray-800">
                                                    <p className="text-[10px] text-indigo-400 font-bold uppercase mb-2 border-b border-gray-800 pb-1">Primary Settlement Bank</p>
                                                    <p className="text-xs font-bold">{user.bankAccount.bankName}</p>
                                                    <p className="text-sm font-mono text-gray-300 my-1">{user.bankAccount.accountNumber}</p>
                                                    <p className="text-[10px] text-gray-400">{user.bankAccount.accountName}</p>
                                                    <p className="text-[10px] text-indigo-300 mt-2">PH: {user.bankAccount.phone || 'N/A'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
