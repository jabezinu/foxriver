import { Outlet } from 'react-router-dom';
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
                toast.error('Failed to sync messages');
                console.error('Error fetching messages:', error);
            }
        };

        if (user) {
            fetchUnreadMessages();
        }
    }, [user, setUnreadMessages, setShowFirstEntryPopup]);

    return (
        <div className="container-app">
            <div className="main-content">
                <Outlet />
            </div>
            <FloatingMail />
            <BottomNav />
            {showFirstEntryPopup && <FirstEntryPopup />}
        </div>
    );
}
