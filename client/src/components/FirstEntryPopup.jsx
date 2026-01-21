import { useAppStore } from '../store/appStore';
import { HiX } from 'react-icons/hi';

export default function FirstEntryPopup() {
    const { setShowFirstEntryPopup } = useAppStore();

    const handleClose = () => {
        setShowFirstEntryPopup(false);
    };

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
                    <p className="text-gray-600 text-sm">Welcome to the platform! Start exploring your tasks and opportunities.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 btn-primary"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}
