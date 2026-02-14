import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageLoader from '../components/PageLoader';

export default function MainLayout() {
    const location = useLocation();

    // Hide bottom nav on specific pages if needed (e.g., login/register usually not here, but maybe others)
    const showBottomNav = !['/login', '/register'].includes(location.pathname);

    return (
        <div className="app-container flex flex-col">
            <main className="flex-1 pb-24 relative overflow-y-auto overflow-x-hidden scrollbar-hide">
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>

            {showBottomNav && <BottomNav />}
        </div>
    );
}
