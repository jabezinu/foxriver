import { useState, useEffect, useRef } from 'react';
import { adminChatAPI } from '../services/api';
import { HiChat, HiUsers, HiPaperAirplane, HiUser } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function Messages() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedChat) {
            scrollToBottom();
        }
    }, [messages, selectedChat]);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await adminChatAPI.getAllChats();
            setChats(res.data.chats);
        } catch (error) {
            toast.error('Failed to load chats');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const res = await adminChatAPI.getMessages(chatId);
            setMessages(res.data.messages);
        } catch (error) {
            toast.error('Failed to load messages');
            console.error(error);
        }
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        fetchMessages(chat._id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || sending) return;

        setSending(true);
        try {
            const res = await adminChatAPI.sendMessage(selectedChat._id, newMessage.trim());
            setMessages(prev => [...prev, res.data.message]);
            setNewMessage('');
            
            // Update last message in chat list
            setChats(prev => prev.map(chat => 
                chat._id === selectedChat._id 
                    ? { ...chat, lastMessage: res.data.message, updatedAt: new Date() }
                    : chat
            ));
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const getUserInfo = (chat) => {
        // Backend returns user data in 'customer' association
        return chat.customer;
    };

    return (
        <div className="animate-fadeIn h-[calc(100vh-8rem)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
                    <p className="text-sm text-gray-500">Manage chat conversations with users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Chat List */}
                <div className="admin-card overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Active Chats ({chats.length})</h3>
                    {loading ? (
                        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading...</div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {chats.map((chat) => {
                                const user = getUserInfo(chat);
                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                            selectedChat?._id === chat._id 
                                                ? 'bg-blue-50 border-blue-200' 
                                                : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <HiUser className="text-white" size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">
                                                    {user?.name || user?.phone || 'Unknown User'}
                                                </h4>
                                                <p className="text-xs text-gray-600 truncate">
                                                    📱 {user?.phone || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {chat.lastMessage?.content || 'No messages yet'}
                                                </p>
                                            </div>
                                            <div className="text-[9px] text-gray-400">
                                                {chat.lastMessage?.timestamp && 
                                                    new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {chats.length === 0 && (
                                <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No active chats</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Chat Window */}
                <div className="admin-card lg:col-span-2 flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="border-b border-gray-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <HiUser className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">
                                            {getUserInfo(selectedChat)?.name || getUserInfo(selectedChat)?.phone || 'Unknown User'}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Phone: {getUserInfo(selectedChat)?.phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto mb-4 min-h-[300px] max-h-[400px]">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <HiChat className="text-gray-300 text-4xl mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">No messages in this chat yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((message) => {
                                            const isAdmin = message.senderDetails?.role === 'admin' || message.senderDetails?.role === 'superadmin';
                                            return (
                                                <div
                                                    key={message._id}
                                                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`flex gap-2 max-w-[70%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            isAdmin ? 'bg-blue-500' : 'bg-gray-400'
                                                        }`}>
                                                            {isAdmin ? (
                                                                <HiChat className="text-white" size={12} />
                                                            ) : (
                                                                <HiUser className="text-white" size={12} />
                                                            )}
                                                        </div>
                                                        <div className={`rounded-xl px-3 py-2 text-sm ${
                                                            isAdmin 
                                                                ? 'bg-blue-500 text-white rounded-br-sm' 
                                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                                        }`}>
                                                            <p className="break-words">{message.content}</p>
                                                            <p className={`text-[9px] mt-1 ${isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                                                    hour: '2-digit', 
                                                                    minute: '2-digit' 
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 admin-input"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg px-4 py-2 transition-colors"
                                >
                                    <HiPaperAirplane size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <HiChat className="text-gray-300 text-6xl mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-600 mb-2">Select a chat to start messaging</h3>
                                <p className="text-sm text-gray-400">Choose a conversation from the list to view and send messages.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
