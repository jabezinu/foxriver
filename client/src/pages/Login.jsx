import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { HiPhone, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import CanvasCaptcha from '../components/CanvasCaptcha';

export default function Login() {
    const navigate = useNavigate();
    const { login, loading, error } = useAuthStore();
    const captchaRef = useRef(null);

    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
        captcha: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [realCaptchaValue, setRealCaptchaValue] = useState('');
    const [formError, setFormError] = useState('');

    const handleCaptchaChange = useCallback((code) => {
        setRealCaptchaValue(code);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
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
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/10 blur-[80px] rounded-full" />

            <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-md w-full p-8 md:p-10 animate-slideUp">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg mb-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter">F</h1>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Foxriver</h2>
                    <p className="text-green-100/60 font-medium">Welcome back, login to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phone Number */}
                    <div className="group">
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2 ml-1">
                            Phone Number
                        </label>
                        <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.02]">
                            <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/50 text-xl" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner"
                                placeholder="+251912345678"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group">
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2 ml-1">
                            Password
                        </label>
                        <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.02]">
                            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/50 text-xl" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                            >
                                {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                            </button>
                        </div>
                    </div>

                    {/* CAPTCHA */}
                    <div className="group">
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2 ml-1">
                            Verification Code
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                name="captcha"
                                value={formData.captcha}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner"
                                placeholder="Enter code from image"
                                required
                            />
                            <CanvasCaptcha ref={captchaRef} onCaptchaChange={handleCaptchaChange} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative group/btn w-full bg-gradient-to-r from-green-500 to-emerald-600 p-[1px] rounded-2xl overflow-hidden active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:active:scale-100"
                    >
                        <div className="bg-[#0f172a] group-hover/btn:bg-transparent transition-all rounded-2xl py-4 flex items-center justify-center font-bold text-white tracking-wide">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </div>
                    </button>
                </form>

                <p className="text-center text-green-100/40 font-medium mt-8">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-400 hover:text-green-300 font-bold transition-colors">
                        Register Now
                    </Link>
                </p>
            </div>
        </div>
    );
}
