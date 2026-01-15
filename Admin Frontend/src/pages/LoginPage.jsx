import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { loginUserAPI } from '../services/userApi';
import './LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await loginUserAPI({ email, password });

            // Success logic
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('isAdminAuthenticated', 'true');
            localStorage.setItem('adminUser', JSON.stringify({
                _id: res.data.user._id,
                name: res.data.user.fullName,
                role: res.data.user.role,
                email: res.data.user.email
            }));

            setIsLoading(false);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Animated Background Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="login-card-container">
                <div className="login-card glass-morphism">
                    <div className="login-header text-center">
                        <div className="app-logo-box">
                            <ShieldCheck className="logo-icon-main" size={40} />
                        </div>
                        <h2>Admin Portal</h2>
                        <p className="text-secondary-light">Please sign in to continue to management</p>
                        {error && <div className="error-message" style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                    </div>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group-login">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group-login">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember Me
                            </label>
                            <Link to="/forgot-password" size={18} className="forgot-password">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loader"></span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="login-footer text-center">
                        <p>© 2026 Admin News Portal. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
