import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOTP } from '../hooks/useOTP';
import { LogOut, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Toggle from '../components/common/Toggle';
import QRCodeDisplay from '../components/auth/QRCodeDisplay';
import OTPInput from '../components/auth/OTPInput';
import api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { setup2FA, verify2FA, disable2FA, error } = useOTP();

    // FIX: Do NOT initialize from user context — it may not be in sync yet.
    // Instead, use a "loading" state and fetch from the backend directly.
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [setupData, setSetupData] = useState<{ qrCodeUrl: string; secret: string } | null>(null);
    const [verificationStep, setVerificationStep] = useState(false);

    // FIX: Fetch the real 2FA status from the backend on every mount.
    // This is the source of truth and bypasses all React state timing issues.
    const fetchStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const res = await api.get('/2fa/status');
            setIs2FAEnabled(res.data.enabled);
        } catch (e) {
            // If request fails, default to false
            setIs2FAEnabled(false);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    // Run on every mount of the Dashboard
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleToggle2FA = async (enabled: boolean) => {
        if (enabled) {
            const data = await setup2FA();
            if (data) {
                setSetupData({ qrCodeUrl: data.qrCodeUrl, secret: data.secret });
                setVerificationStep(true);
            }
        } else {
            if (window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
                const success = await disable2FA();
                if (success) {
                    setIs2FAEnabled(false);
                    setSetupData(null);
                    setVerificationStep(false);
                }
            }
        }
    };

    const handleVerify = async (code: string) => {
        const success = await verify2FA(code);
        if (success) {
            // After successful verification, refresh from backend
            await fetchStatus();
            setVerificationStep(false);
            setSetupData(null);
            alert('2FA has been successfully enabled!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.username}!</p>
                    </div>
                    <Button onClick={logout} variant="secondary" className="w-auto px-4 !py-2">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Security Settings Card */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-primary-500" />
                        Security Settings
                    </h2>

                    <div className="p-4 border border-gray-100 dark:border-dark-border rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication (TOTP)</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Add an extra layer of security to your account using an authenticator app.
                            </p>
                        </div>
                        {/* Show spinner while fetching status to prevent flicker */}
                        {statusLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : (
                            <Toggle enabled={is2FAEnabled} onChange={handleToggle2FA} />
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm flex items-center">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* 2FA Setup Flow */}
                    {verificationStep && setupData && (
                        <div className="mt-6 p-6 border border-primary-100 dark:border-primary-900/30 bg-primary-50 dark:bg-primary-900/10 rounded-xl space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-center dark:text-white">Setup Authenticator App</h3>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                Scan the QR code below with your authenticator app (like Google Authenticator or Authy),
                                or enter the secret key manually.
                            </p>

                            <QRCodeDisplay url={setupData.qrCodeUrl} secret={setupData.secret} />

                            <div className="max-w-xs mx-auto pt-4">
                                <p className="mb-2 text-sm font-medium text-center dark:text-gray-300">Enter the 6-digit code</p>
                                <OTPInput onComplete={handleVerify} />
                            </div>

                            <div className="flex gap-4 justify-center pt-4">
                                <Button variant="secondary" onClick={() => setVerificationStep(false)} className="w-auto">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
