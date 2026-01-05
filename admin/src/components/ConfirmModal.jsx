import Modal from './Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDangerous = false }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`flex-1 py-3 rounded-xl text-white font-bold text-xs uppercase shadow-lg transition-all ${isDangerous
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
