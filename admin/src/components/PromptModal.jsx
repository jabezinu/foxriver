import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function PromptModal({ isOpen, onClose, onConfirm, title, message, placeholder = '', confirmText = 'Submit' }) {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (isOpen) setValue('');
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(value);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="admin-input w-full mb-6"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                    required
                />
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                        {confirmText}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
