import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import FloatingMail from '../components/FloatingMail';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { messageAPI } from '../services/api';

export default function MainLayout() {
    const { user } = useAuthStore();
    const { setUnreadMessages, messageQueue, setMessageQueue, nextMessage } = useAppStore();
    const location = useLocation();

    // Hide bottom nav on specific pages if needed (e.g., login/register usually not here, but maybe others)
    const showBottomNav = !['/login', '/register'].includes(location.pathname) && messageQueue.length === 0;

    useEffect(() => {
        // Fetch unread messages count and check for welcome messages
        const fetchMessages = async () => {
            try {
                const shouldShowWelcome = sessionStorage.getItem('showWelcome');
                const response = await messageAPI.getUserMessages();
                const messages = response.data.messages;
                const unread = messages.filter(msg => !msg.isRead).length;
                setUnreadMessages(unread);

                if (shouldShowWelcome === 'true') {
                    setMessageQueue(messages);
                    sessionStorage.removeItem('showWelcome');
                }
            } catch (error) {
                // Silent fail for UX unless critical
                console.error('Error fetching messages:', error);
            }
        };

        if (user) {
            fetchMessages();
        }
    }, [user, setUnreadMessages, setMessageQueue]);

    const handleNextMessage = () => {
        nextMessage();
    };

    return (
        <div className="app-container flex flex-col">
            <main className="flex-1 pb-24 relative overflow-y-auto overflow-x-hidden scrollbar-hide">
                <Outlet />
            </main>

            {messageQueue.length === 0 && <FloatingMail />}

            {showBottomNav && <BottomNav />}

            {messageQueue.length > 0 && (
                <Modal
                    isOpen={true}
                    onClose={handleNextMessage}
                    title={messageQueue[0].title}
                    backdropClosable={false}
                >
                    <div className="space-y-6">
                        <div className="bg-white/30 rounded-2xl p-4 max-h-60 overflow-y-auto border border-zinc-800">
                            <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{messageQueue[0].content}</p>
                        </div>
                        <Button onClick={handleNextMessage} fullWidth>
                            Got it
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
