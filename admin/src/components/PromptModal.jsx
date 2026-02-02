import Modal from './Modal';

export default function PromptModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Submit' }) {
    const handleConfirm = () => {
        onConfirm('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
