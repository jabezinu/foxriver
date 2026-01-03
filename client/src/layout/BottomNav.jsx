import { NavLink } from 'react-router-dom';
import { HiHome, HiClipboardList, HiCurrencyDollar, HiUser } from 'react-icons/hi';

export default function BottomNav() {
    const navItems = [
        { path: '/', icon: HiHome, label: 'Home' },
        { path: '/task', icon: HiClipboardList, label: 'Task' },
        { path: '/wealth', icon: HiCurrencyDollar, label: 'Wealth' },
        { path: '/mine', icon: HiUser, label: 'Mine' },
    ];

    return (
        <nav className="bottom-nav-fixed">
            <div className="max-w-480 mx-auto">
                <div className="flex justify-around items-center py-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 ${isActive
                                    ? 'text-green-600 scale-110'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`text-2xl mb-1 ${isActive ? 'animate-bounce' : ''}`} />
                                    <span className="text-xs font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute bottom-0 w-1 h-1 bg-green-600 rounded-full"></div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
