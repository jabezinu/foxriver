import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { HiPhone, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register, loading, error } = useAuthStore();

    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
        confirmPassword: '',
        invitationCode: searchParams.get('ref') || '',
        captcha: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [captchaValue] = useState(() => Math.floor(1000 + Math.random() * 9000));
    const [formError, setFormError] = useState('');

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

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.captcha !== captchaValue.toString()) {
            toast.error('Incorrect CAPTCHA');
            return;
        }

        const result = await register({
            phone: formData.phone,
            password: formData.password,
            invitationCode: formData.invitationCode || undefined,
        });

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/', { replace: true });
        } else {
            toast.error(result.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/10 blur-[80px] rounded-full" />

            <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-md w-full p-8 md:p-10 animate-slideUp">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg mb-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter">F</h1>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Join Foxriver</h2>
                    <p className="text-green-100/60 font-medium">Create your account to start earning</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Phone Number */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-green-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                            Phone Number
                        </label>
                        <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.01]">
                            <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/50 text-xl" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner text-sm"
                                placeholder="+251912345678"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-green-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                            Security Password
                        </label>
                        <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.01]">
                            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/50 text-xl" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner text-sm"
                                placeholder="At least 6 characters"
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

                    {/* Confirm Password */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-green-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                            Confirm Password
                        </label>
                        <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.01]">
                            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/50 text-xl" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner text-sm"
                                placeholder="Repeat your password"
                                required
                            />
                        </div>
                    </div>

                    {/* Invitation Code */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-green-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                            Invitation Code
                        </label>
                        <input
                            type="text"
                            name="invitationCode"
                            value={formData.invitationCode}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner text-sm"
                            placeholder="Optional code"
                        />
                    </div>

                    {/* CAPTCHA */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-green-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                            Verification: <span className="text-white ml-2 tabular-nums">{captchaValue}</span>
                        </label>
                        <input
                            type="text"
                            name="captcha"
                            value={formData.captcha}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-white/20 outline-none focus:border-green-400/50 focus:bg-white/10 transition-all shadow-inner text-sm"
                            placeholder="Enter 4-digit code"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative group/btn w-full bg-gradient-to-r from-green-500 to-emerald-600 p-[1px] rounded-2xl overflow-hidden active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:active:scale-100 mt-4"
                    >
                        <div className="bg-[#0f172a] group-hover/btn:bg-transparent transition-all rounded-2xl py-4 flex items-center justify-center font-bold text-white tracking-wide">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Creating Account...
                                </span>
                            ) : (
                                'Register Now'
                            )}
                        </div>
                    </button>
                </form>

                <p className="text-center text-green-100/40 font-medium mt-8">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-400 hover:text-green-300 font-bold transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
