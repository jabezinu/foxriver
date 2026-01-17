import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { messageAPI } from '../services/api';
import { HiX } from 'react-icons/hi';

export default function FirstEntryPopup() {
    const navigate = useNavigate();
    const { setShowFirstEntryPopup } = useAppStore();
    const [latestMessage, setLatestMessage] = useState(null);

    useEffect(() => {
        const fetchLatestMessage = async () => {
            try {
                const response = await messageAPI.getUserMessages();
                const unreadMessages = response.data.messages.filter(msg => !msg.isRead);
                if (unreadMessages.length > 0) {
                    setLatestMessage(unreadMessages[0]);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchLatestMessage();
    }, []);

    const handleClose = () => {
        setShowFirstEntryPopup(false);
    };

    const handleOpenMail = () => {
        setShowFirstEntryPopup(false);
        navigate('/mail');
    };

    if (!latestMessage) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Welcome to Foxriver!</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <HiX className="text-2xl" />
                    </button>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{latestMessage.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3">{latestMessage.content}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleOpenMail}
                        className="flex-1 btn-primary"
                    >
                        View Messages
                    </button>
                </div>
            </div>
        </div>
    );
}
