import { useNavigate } from 'react-router-dom';
import { HiMail } from 'react-icons/hi';
import { useAppStore } from '../store/appStore';

export default function FloatingMail() {
    const navigate = useNavigate();
    const { unreadMessages } = useAppStore();

    return (
        <div
            className="floating-mail"
            onClick={() => navigate('/mail')}
        >
            <HiMail className="text-2xl" />
            {unreadMessages > 0 && (
                <span className="badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
            )}
        </div>
    );
}
