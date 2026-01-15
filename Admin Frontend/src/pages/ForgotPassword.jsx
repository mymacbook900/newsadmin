import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Key } from 'lucide-react';
import { forgotPasswordAPI, verifyOTPAPI, resetPasswordAPI } from '../services/userApi';
import './ForgotPassword.css';
import './LoginPage.css'; // Reuse some login styles

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [step, setStep] = useState('EMAIL'); // EMAIL, OTP, RESET, SUCCESS
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await forgotPasswordAPI(email);
            setStep('OTP');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await verifyOTPAPI(email, otp);
            setStep('RESET');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await resetPasswordAPI(email, otp, password);
            setStep('SUCCESS');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = (title, subtitle) => (
        <div className="login-header text-center">
            <div className="app-logo-box">
                <ShieldCheck className="logo-icon-main" size={40} />
            </div>
            <h2>{title}</h2>
            <p className="text-secondary-light">{subtitle}</p>
            {error && <div className="error-message" style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        </div>
    );

    const renderStep = () => {
        switch (step) {
            case 'EMAIL':
                return (
                    <>
                        {renderHeader("Reset Password", "Enter your email and we'll send you an OTP to reset your password")}
                        <form className="login-form" onSubmit={handleSendOTP}>
                            <div className="form-group-login">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className={`login-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                {isLoading ? <span className="loader"></span> : "Send OTP"}
                            </button>
                        </form>
                    </>
                );
            case 'OTP':
                return (
                    <>
                        {renderHeader("Verify OTP", `We've sent a 6-digit code to ${email}`)}
                        <form className="login-form" onSubmit={handleVerifyOTP}>
                            <div className="form-group-login">
                                <label>Enter OTP</label>
                                <div className="input-with-icon">
                                    <Key size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.25rem' }}
                                    />
                                </div>
                            </div>
                            <button type="submit" className={`login-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                {isLoading ? <span className="loader"></span> : "Verify OTP"}
                            </button>
                            <p className="resend-text text-center mt-4">
                                Didn't receive the code? <button type="button" className="btn-link" onClick={handleSendOTP} disabled={isLoading}>Resend</button>
                            </p>
                        </form>
                    </>
                );
            case 'RESET':
                return (
                    <>
                        {renderHeader("New Password", "Create a strong password for your account")}
                        <form className="login-form" onSubmit={handleResetPassword}>
                            <div className="form-group-login">
                                <label>New Password</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group-login">
                                <label>Confirm New Password</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className={`login-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                {isLoading ? <span className="loader"></span> : "Reset Password"}
                            </button>
                        </form>
                    </>
                );
            case 'SUCCESS':
                return (
                    <div className="text-center">
                        <div className="success-icon-box" style={{ marginBottom: '1.5rem' }}>
                            <CheckCircle2 size={60} style={{ color: '#10b981' }} />
                        </div>
                        <h2>Password Reset Successful</h2>
                        <p className="text-secondary-light mt-2">
                            Your password has been changed successfully. You can now sign in with your new password.
                        </p>
                        <div className="mt-8">
                            <Link to="/login" className="login-submit-btn" style={{ textDecoration: 'none', display: 'block' }}>
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="login-wrapper">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="login-card-container">
                <div className="login-card glass-morphism">
                    {renderStep()}
                    {step !== 'SUCCESS' && (
                        <div className="login-footer text-center">
                            <Link to="/login" className="back-to-login">
                                <ArrowLeft size={16} />
                                <span>Back to Sign In</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
