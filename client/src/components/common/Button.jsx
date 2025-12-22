const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    loading = false,
    disabled = false,
    fullWidth = false,
    ...props
}) => {
    const baseClasses = 'px-6 py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';

    const variants = {
        primary: 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white shadow-orange-500/30',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700',
        outline: 'border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10',
        danger: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
        success: 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-emerald-500/30'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseClasses}
                ${variants[variant] || variants['primary']}
                ${fullWidth ? 'w-full' : ''}
                ${props.className || ''}
            `}
            {...props}
        >
            {loading ? (
                <>
                    <div className="relative w-5 h-5">
                        <div className="absolute top-0 left-0 w-full h-full border-2 border-current opacity-30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-2 border-current rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <span>Processing...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
