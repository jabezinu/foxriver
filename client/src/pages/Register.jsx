import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import CanvasCaptcha from '../components/CanvasCaptcha';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register, loading } = useAuthStore();
    const captchaRef = useRef(null);

    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
        confirmPassword: '',
        invitationCode: searchParams.get('ref') || '',
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

        // Validation
        if (!formData.phone.startsWith('+251') || formData.phone.length !== 13) {
            toast.error('Please enter a valid Ethiopian phone number (+251XXXXXXXXX)');
            captchaRef.current?.refreshCaptcha();
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            captchaRef.current?.refreshCaptcha();
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            captchaRef.current?.refreshCaptcha();
            return;
        }

        if (formData.captcha.toUpperCase() !== realCaptchaValue) {
            toast.error('Incorrect CAPTCHA');
            setFormData(prev => ({ ...prev, captcha: '' }));
            captchaRef.current?.refreshCaptcha();
            return;
        }

        const result = await register({
            phone: formData.phone,
            password: formData.password,
            invitationCode: formData.invitationCode || undefined,
        });

        if (result.success) {
            toast.success('Account created successfully!');
            sessionStorage.setItem('showWelcome', 'true');
            navigate('/', { replace: true });
        } else {
            toast.error(result.message || 'Registration failed');
            setFormData(prev => ({ ...prev, captcha: '' }));
            captchaRef.current?.refreshCaptcha();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-60" />
            </div>

            <Card className="w-full max-w-md z-10 p-6 shadow-2xl border-none">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow mb-3">
                        <span className="text-2xl font-black text-white tracking-tighter">F</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Join Foxriver</h2>
                    <p className="text-gray-500 text-sm mt-1">Start your wealth journey today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all duration-300 pl-11 pr-11 bg-white"
                                placeholder="Create password"
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

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all duration-300 pl-11 bg-white"
                                placeholder="Repeat password"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
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
                        Create Account
                    </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                        Sign In
                    </Link>
                </p>
            </Card>
        </div>
    );
}
