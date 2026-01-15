import clsx from 'clsx';
import './Button.css';

/**
 * Button Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.className]
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    return (
        <button
            className={clsx(
                'btn',
                `btn-${variant}`,
                `btn-${size}`,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
