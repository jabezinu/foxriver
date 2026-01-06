import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import CanvasCaptcha from '../components/CanvasCaptcha';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Login() {
    const navigate = useNavigate();
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

        if (!formData.phone.startsWith('+251') || formData.phone.length !== 13) {
            toast.error('Please enter a valid Ethiopian phone number (+251XXXXXXXXX)');
            return;
        }

        if (formData.captcha.toUpperCase() !== realCaptchaValue) {
            toast.error('Incorrect CAPTCHA');
            setFormData(prev => ({ ...prev, captcha: '' }));
            captchaRef.current?.refreshCaptcha();
            return;
        }

        const result = await login({
            phone: formData.phone,
            password: formData.password,
        });

        if (result.success) {
            toast.success('Welcome back!');
            sessionStorage.setItem('showWelcome', 'true');
            navigate('/', { replace: true });
        } else {
            toast.error(result.message || 'Login failed');
            setFormData(prev => ({ ...prev, captcha: '' }));
            captchaRef.current?.refreshCaptcha();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-60" />
            </div>

            <Card className="w-full max-w-md z-10 p-8 shadow-2xl border-none">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow mb-4">
                        <span className="text-3xl font-black text-white tracking-tighter">F</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-1">Sign in to manage your portable wealth</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+251912345678"
                        icon={<Phone size={18} />}
                        required
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all duration-300 pl-11 pr-11 bg-white text-gray-900"
                                placeholder="••••••••"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Verification</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                name="captcha"
                                value={formData.captcha}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all duration-300 bg-white"
                                placeholder="Enter code"
                                required
                            />
                            <div className="shrink-0 h-[50px] overflow-hidden rounded-xl border-2 border-gray-100">
                                <CanvasCaptcha ref={captchaRef} onCaptchaChange={handleCaptchaChange} />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" loading={loading} fullWidth size="lg">
                        Sign In
                    </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                        Register Now
                    </Link>
                </p>
            </Card>
        </div>
    );
}
