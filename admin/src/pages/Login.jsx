import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { HiPhone, HiLockClosed, HiShieldCheck } from 'react-icons/hi';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, loading, error } = useAdminAuthStore();

    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData);
        if (result.success) {
            toast.success('Login successful!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-700 animate-slideUp">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                        <HiShieldCheck className="text-white text-4xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Admin</h1>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Admin ID / Phone</label>
                        <div className="relative">
                            <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-[#334155] border-transparent rounded-xl px-12 py-3.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="+251..."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Security Password</label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#334155] border-transparent rounded-xl px-12 py-3.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <span className="spinner spinner-white"></span> : 'AUTHENTICATE ACCESS'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Terminal • Foxriver Management</p>
                </div>
            </div>
        </div>
    );
}
