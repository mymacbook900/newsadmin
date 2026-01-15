import clsx from 'clsx';
import './Table.css';

export function Table({ children, className }) {
    return (
        <div className={clsx('table-container glass-panel', className)}>
            <table className="table">
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children }) {
    return <thead className="table-header">{children}</thead>;
}

export function TableBody({ children }) {
    return <tbody className="table-body">{children}</tbody>;
}

export function TableRow({ children, className }) {
    return <tr className={clsx('table-row', className)}>{children}</tr>;
}

export function TableHead({ children, className }) {
    return <th className={clsx('table-head', className)}>{children}</th>;
}

export function TableCell({ children, className }) {
    return <td className={clsx('table-cell', className)}>{children}</td>;
}
