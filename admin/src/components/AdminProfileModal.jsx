import { useState, useEffect } from 'react';
import Modal from './Modal';
import { adminProfileAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '../store/authStore';

export default function AdminProfileModal({ isOpen, onClose, admin }) {
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const { logout } = useAdminAuthStore();

    useEffect(() => {
        if (admin && isOpen) {
            setFormData(prev => ({ ...prev, phone: admin.phone || '' }));
        }
    }, [admin, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            const updateData = {
                phone: formData.phone
            };
            if (formData.password) {
                updateData.password = formData.password;
            }

            await adminProfileAPI.updateProfile(updateData);
            toast.success('Profile updated successfully');

            // If password changed, maybe force logout? Or just close modal.
            // Let's just close modal for now, but if phone changed it might affect login.
            onClose();

            // Optional: Reload window to refresh user state if handled globally, 
            // but effectively we might want to update the store. 
            // For safety, if they change credentials, asking them to login again is good practice.
            if (formData.password || (admin.phone !== formData.phone)) {
                toast.success('Credentials changed. Please login again.');
                logout();
                window.location.href = '/login';
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
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
                    <p className="text-xs text-gray-400 mb-3 italic">Leave blank to keep current password</p>
                    <div className="space-y-4">
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
                        {formData.password && (
                            <div className="animate-fadeIn">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    className="admin-input"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}
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
