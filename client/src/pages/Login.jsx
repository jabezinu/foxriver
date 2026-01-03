import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { HiPhone, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
    const navigate = useNavigate();
    const { login, loading, error } = useAuthStore();

    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
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
        setFormError('');

        // Validation
        if (!formData.phone.startsWith('+251') || formData.phone.length !== 13) {
            setFormError('Please enter a valid Ethiopian phone number (+251XXXXXXXXX)');
            return;
        }

        if (formData.captcha !== captchaValue.toString()) {
            setFormError('Incorrect CAPTCHA');
            return;
        }

        const result = await login({
            phone: formData.phone,
            password: formData.password,
        });

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setFormError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        Foxriver
                    </h1>
                    <p className="text-gray-600">Welcome back!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input-field pl-12"
                                placeholder="+251912345678"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field pl-12 pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                            </button>
                        </div>
                    </div>

                    {/* CAPTCHA */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter the code: <span className="font-mono font-bold text-green-600">{captchaValue}</span>
                        </label>
                        <input
                            type="text"
                            name="captcha"
                            value={formData.captcha}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter code"
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {(formError || error) && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                            {formError || error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="spinner"></span> Logging in...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-600 font-semibold hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
