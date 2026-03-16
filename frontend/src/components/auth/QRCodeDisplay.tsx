import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
    url: string;
    secret: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, secret }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-white dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={url} size={150} level="M" />
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Manual Entry Code</p>
                <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded text-primary-600 dark:text-primary-400 font-mono tracking-wider font-bold">
                    {secret}
                </code>
            </div>
        </div>
    );
};

export default QRCodeDisplay;
