import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Wallet, User, Users } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/task', icon: ClipboardList, label: 'Task' },
        { path: '/team', icon: Users, label: 'Team' },
        { path: '/wealth', icon: Wallet, label: 'Wealth' },
        { path: '/mine', icon: User, label: 'Account' },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-4 pb-4 pt-2 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800">
            <div className="text-center mt-1">
                <p className="text-zinc-600 text-[9px]">© 2026</p>
            </div>
            <div className="flex justify-around items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 w-16 h-16 ${isActive
                                ? 'text-primary-500'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`absolute inset-0 bg-primary-500/10 rounded-2xl transition-transform duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                <div className="relative z-10 flex flex-col items-center">
                                    <item.icon
                                        size={24}
                                        className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span
                                        className={`text-[10px] font-bold transition-all duration-300 absolute -bottom-1 w-max ${isActive ? 'opacity-100 translate-y-0 text-primary-500' : 'opacity-0 translate-y-2'
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
