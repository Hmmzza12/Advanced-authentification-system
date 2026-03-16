import React from 'react';

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label }) => {
    return (
        <div className="flex items-center justify-between">
            {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
            <button
                type="button"
                className={`${
                    enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface`}
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={`${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};

export default Toggle;
