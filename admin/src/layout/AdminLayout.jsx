import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/authStore';
import {
    HiChartBar, HiUsers, HiCurrencyDollar, HiBriefcase,
    HiVideoCamera, HiNewspaper, HiPhotograph, HiMail, HiLogout
} from 'react-icons/hi';

export default function AdminLayout() {
    const { logout, admin } = useAdminAuthStore();
    const navigate = useNavigate();

    // Check for inactivity every minute
    useEffect(() => {
        const checkActivity = () => {
            const lastActive = localStorage.getItem('foxriver_admin_last_active');
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            if (lastActive && (now - parseInt(lastActive)) > oneDay) {
                logout();
            }
        };

        const intervalId = setInterval(checkActivity, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, [logout]);

    // Track user activity to keep session alive
    useEffect(() => {
        const handleActivity = () => {
            const lastActive = parseInt(localStorage.getItem('foxriver_admin_last_active') || '0');
            // Only update if more than 1 minute has passed since last update
            if (Date.now() - lastActive > 60000) {
                localStorage.setItem('foxriver_admin_last_active', Date.now().toString());
            }
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, []);

    const menuItems = [
        { path: '/', icon: HiChartBar, label: 'Dashboard' },
        { path: '/users', icon: HiUsers, label: 'Users' },
        { path: '/deposits', icon: HiCurrencyDollar, label: 'Deposits' },
        { path: '/withdrawals', icon: HiBriefcase, label: 'Withdrawals' },
        { path: '/tasks', icon: HiVideoCamera, label: 'Tasks' },
        { path: '/news', icon: HiNewspaper, label: 'News' },
        { path: '/qna', icon: HiPhotograph, label: 'Q&A' },
        { path: '/messages', icon: HiMail, label: 'Messages' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Foxriver Ethiopia</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon className="text-xl" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold">
                            {admin?.phone?.slice(-1)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate">{admin?.phone}</p>
                            <p className="text-[10px] text-gray-400 uppercase">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold"
                    >
                        <HiLogout />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}
