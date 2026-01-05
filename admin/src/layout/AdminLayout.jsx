import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/authStore';
import {
    HiChartBar, HiUsers, HiCurrencyDollar, HiBriefcase,
    HiVideoCamera, HiNewspaper, HiPhotograph, HiMail, HiLogout, HiMenu, HiX, HiCog
} from 'react-icons/hi';
import AdminProfileModal from '../components/AdminProfileModal';

export default function AdminLayout() {
    const { logout, admin } = useAdminAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

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
            <AdminProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                admin={admin}
            />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1e293b] text-white h-16 flex items-center justify-between px-4 z-30 shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <HiMenu className="text-2xl" />
                    </button>
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
                    {admin?.phone?.slice(-1)}
                </div>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 bottom-0 left-0 w-64 bg-[#1e293b] text-white flex flex-col z-40 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Foxriver Ethiopia</p>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                        >
                            <HiX className="text-xl" />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon className="text-xl shrink-0" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700 mt-auto">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold shrink-0">
                            {admin?.phone?.slice(-1)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate">{admin?.phone}</p>
                            <p className="text-[10px] text-gray-400 uppercase">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors text-sm font-bold mb-2"
                    >
                        <HiCog className="shrink-0" />
                        Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold"
                    >
                        <HiLogout className="shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 lg:ml-64 mt-16 lg:mt-0 transition-all duration-300 w-full overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
