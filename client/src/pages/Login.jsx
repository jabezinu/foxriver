import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import CanvasCaptcha from '../components/CanvasCaptcha';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import logo from '../assets/logo.png';

export default function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login, loading } = useAuthStore();
    const captchaRef = useRef(null);

    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
        captcha: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [realCaptchaValue, setRealCaptchaValue] = useState('');

    const handleCaptchaChange = useCallback((code) => {
        setRealCaptchaValue(code);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let phone = formData.phone.trim();
        if (phone.startsWith('0')) {
            phone = '+251' + phone.substring(1);
        } else if (phone.startsWith('9')) {
            phone = '+251' + phone;
        }

        if (!phone.startsWith('+251') || phone.length !== 13) {
            toast.error(t('errors.invalidPhone'));
            return;
        }

        if (formData.captcha.toUpperCase() !== realCaptchaValue) {
            toast.error(t('errors.incorrectCaptcha'));
            setFormData(prev => ({ ...prev, captcha: '' }));
            captchaRef.current?.refreshCaptcha();
            return;
        }

        const result = await login({
            phone: phone,
            password: formData.password,
        });

        if (result.success) {
            toast.success(t('success.welcomeBack'));
            navigate('/', { replace: true });
        } else {
            toast.error(result.message || t('errors.loginFailed'));
            setFormData(prev => ({ ...prev, captcha: '' }));
            captchaRef.current?.refreshCaptcha();
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md z-10 p-8 shadow-2xl border-none bg-zinc-900/90 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 shadow-glow mb-4">
                        <img src={logo} alt="Novis Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{t('auth.welcomeBack')}</h2>
                    <p className="text-zinc-500 text-sm mt-1">{t('auth.signInSubtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label={t('auth.phoneNumber')}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+251912345678 or +251712345678"
                        icon={<Phone size={18} />}
                        required
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300 ml-1">{t('auth.password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all duration-300 pl-11 pr-11 placeholder-zinc-600"
                                placeholder="••••••••"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                <Lock size={18} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">{t('auth.verification')}</label>
                        <div className="space-y-3">
                            <div className="flex justify-center">
                                <div className="shrink-0 h-[50px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                                    <CanvasCaptcha ref={captchaRef} onCaptchaChange={handleCaptchaChange} />
                                </div>
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="captcha"
                                value={formData.captcha}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all duration-300 placeholder-zinc-600"
                                placeholder={t('auth.enterCode')}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" fullWidth size="lg" className="shadow-glow font-bold">
                        {t('auth.login')}
                    </Button>
                </form>

                <p className="text-center text-zinc-500 text-sm mt-8">
                    {t('auth.dontHaveAccount')}{' '}
                    <Link to="/register" className="text-primary-500 font-bold hover:text-primary-400 hover:underline transition-colors">
                        {t('auth.registerNow')}
                    </Link>
                </p>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center space-y-3">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">App Validity Period</p>
                        <p className="text-xs text-primary-400 font-semibold">
                            January 15, 2026 - January 14, 2027
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">Notice</p>
                        <p className="text-xs text-zinc-500 leading-relaxed italic">
                            "the company have the right to Edit, Change and shut down the app at any time"
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
