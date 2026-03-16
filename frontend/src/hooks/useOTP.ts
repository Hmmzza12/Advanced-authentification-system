import { useState } from 'react';
import api from '../services/api';
import type { Setup2FAResponse } from '../types/auth.types';

export const useOTP = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setup2FA = async (): Promise<Setup2FAResponse | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post<Setup2FAResponse>('/2fa/setup');
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to setup 2FA');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const verify2FA = async (code: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/2fa/verify', { code });
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP code');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const disable2FA = async (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete('/2fa/disable');
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        setup2FA,
        verify2FA,
        disable2FA,
        isLoading,
        error
    };
};
