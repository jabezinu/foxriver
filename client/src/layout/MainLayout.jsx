import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import FloatingMail from '../components/FloatingMail';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { messageAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import FirstEntryPopup from '../components/FirstEntryPopup';

export default function MainLayout() {
    const { user } = useAuthStore();
    const { setUnreadMessages, showFirstEntryPopup, setShowFirstEntryPopup } = useAppStore();
    const location = useLocation();

    // Hide bottom nav on specific pages if needed (e.g., login/register usually not here, but maybe others)
    const showBottomNav = !['/login', '/register'].includes(location.pathname);

    useEffect(() => {
        // Fetch unread messages count
        const fetchUnreadMessages = async () => {
            try {
                const response = await messageAPI.getUserMessages();
                const unread = response.data.messages.filter(msg => !msg.isRead).length;
                setUnreadMessages(unread);

                // Show first entry popup if there are unread messages and user just logged in
                if (unread > 0 && !sessionStorage.getItem('foxriver_popup_shown')) {
                    setShowFirstEntryPopup(true);
                    sessionStorage.setItem('foxriver_popup_shown', 'true');
                }
            } catch (error) {
                // Silent fail for UX unless critical
                console.error('Error fetching messages:', error);
            }
        };

        if (user) {
            fetchUnreadMessages();
        }
    }, [user, setUnreadMessages, setShowFirstEntryPopup]);

    return (
        <div className="app-container flex flex-col">
            <main className="flex-1 pb-24 relative overflow-y-auto overflow-x-hidden scrollbar-hide">
                <Outlet />
            </main>

            <FloatingMail />

            {showBottomNav && <BottomNav />}

            {showFirstEntryPopup && <FirstEntryPopup />}
        </div>
    );
}
