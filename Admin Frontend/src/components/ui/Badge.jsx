import clsx from 'clsx';
import './Badge.css';

/**
 * Badge Component
 * @param {Object} props
 * @param {'default' | 'success' | 'warning' | 'danger' | 'info'} [props.variant='default']
 */
export default function Badge({ children, variant = 'default', className }) {
    return (
        <span className={clsx('badge', `badge-${variant}`, className)}>
            {children}
        </span>
    );
}
