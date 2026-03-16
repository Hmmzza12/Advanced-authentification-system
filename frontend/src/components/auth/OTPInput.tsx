import React, { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    error?: string | null;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, error }) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }

        const currentOtp = newOtp.join('');
        if (currentOtp.length === length) {
            onComplete(currentOtp);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="flex gap-2 sm:gap-4 justify-center">
                {otp.map((value, index) => (
                    <input
                        key={index}
                        ref={(ref) => { inputRefs.current[index] = ref; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold bg-white dark:bg-dark-bg border ${
                            error ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white transition-all`}
                    />
                ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
    );
};

export default OTPInput;
