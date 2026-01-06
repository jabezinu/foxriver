import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Wallet, User } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/task', icon: ClipboardList, label: 'Task' },
        { path: '/wealth', icon: Wallet, label: 'Wealth' },
        { path: '/mine', icon: User, label: 'Account' },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-4 pb-4 pt-2 bg-white/90 backdrop-blur-md border-t border-gray-100">
            <div className="flex justify-around items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 w-16 h-16 ${isActive
                                ? 'text-primary-600'
                                : 'text-gray-400 hover:text-primary-400'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`absolute inset-0 bg-primary-50 rounded-2xl transition-transform duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                <div className="relative z-10 flex flex-col items-center">
                                    <item.icon
                                        size={24}
                                        className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span
                                        className={`text-[10px] font-semibold transition-all duration-300 absolute -bottom-1 w-max ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
