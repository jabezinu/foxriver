import { useState, useEffect } from 'react';
import Modal from './Modal';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '../store/authStore';

export default function AdminProfileModal({ isOpen, onClose, admin }) {
    const [formData, setFormData] = useState({
        phone: '',
        currentPassword: '',
        password: '',
        confirmPassword: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const { logout, updateProfile } = useAdminAuthStore();

    useEffect(() => {
        if (admin && isOpen) {
            setFormData(prev => ({
                ...prev,
                phone: admin.phone || '',
                currentPassword: '',
                password: '',
                confirmPassword: ''
            }));
        }
    }, [admin, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password) {
            if (!formData.currentPassword) {
                toast.error('Current password is required to set a new password');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }
        }

        setSubmitting(true);
        try {
            const updateData = {
                phone: formData.phone
            };

            if (formData.password) {
                updateData.password = formData.password;
                updateData.currentPassword = formData.currentPassword;
            }

            const res = await updateProfile(updateData);
            if (res.success) {
                toast.success('Profile updated successfully');
                onClose();

                if (formData.password || (admin.phone !== formData.phone)) {
                    toast.success('Credentials changed. Please login again.');
                    logout();
                    window.location.href = '/login';
                }
            } else {
                toast.error(res.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Administrator Settings">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Phone</label>
                    <input
                        type="tel"
                        className="admin-input"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-3 italic">Leave new password blank to keep current one</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                            <input
                                type="password"
                                className="admin-input"
                                value={formData.currentPassword}
                                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                placeholder="Required to change password"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                            <input
                                type="password"
                                className="admin-input"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="admin-input"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
