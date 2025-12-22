import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTrash, FaBan, FaTimes } from 'react-icons/fa';
import ModalPortal from './ModalPortal';

const variantConfig = {
    danger: {
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        buttonBg: 'bg-red-600 hover:bg-red-700',
        defaultIcon: FaExclamationTriangle,
    },
    warning: {
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        buttonBg: 'bg-orange-600 hover:bg-orange-700',
        defaultIcon: FaBan,
    },
    success: {
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        defaultIcon: FaCheck,
    },
    info: {
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        defaultIcon: FaInfoCircle,
    },
};

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    icon: CustomIcon,
    loading = false,
}) => {
    if (!isOpen) return null;

    const config = variantConfig[variant] || variantConfig.danger;
    const IconComponent = CustomIcon || config.defaultIcon;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 animation-scale-up">
                    {/* Header with Icon */}
                    <div className="flex flex-col items-center mb-4">
                        <div className={`h-12 w-12 rounded-full ${config.iconBg} flex items-center justify-center mb-3`}>
                            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                            {title}
                        </h3>
                    </div>

                    {/* Message */}
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {typeof message === 'string' ? <p>{message}</p> : message}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 ${config.buttonBg} text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default ConfirmModal;
