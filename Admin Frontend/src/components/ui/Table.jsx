import clsx from 'clsx';
import './Table.css';
import { useRef, useEffect } from 'react';

export function Table({ children, className }) {
  const topRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const top = topRef.current;
    const table = tableRef.current;
    if (!top || !table) return;

    /* ================= SYNC TOP & BOTTOM SCROLL ================= */
    const syncTop = () => (table.scrollLeft = top.scrollLeft);
    const syncTable = () => (top.scrollLeft = table.scrollLeft);

    top.addEventListener("scroll", syncTop);
    table.addEventListener("scroll", syncTable);

    /* ================= DRAG TO SCROLL (CENTER) ================= */
    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      startX = e.pageX - table.offsetLeft;
      scrollLeft = table.scrollLeft;
      table.style.cursor = "grabbing";
    };

    const mouseLeave = () => {
      isDown = false;
      table.style.cursor = "default";
    };

    const mouseUp = () => {
      isDown = false;
      table.style.cursor = "default";
    };

    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - table.offsetLeft;
      const walk = (x - startX) * 1.5;
      table.scrollLeft = scrollLeft - walk;
    };

    table.addEventListener("mousedown", mouseDown);
    table.addEventListener("mouseleave", mouseLeave);
    table.addEventListener("mouseup", mouseUp);
    table.addEventListener("mousemove", mouseMove);

    return () => {
      top.removeEventListener("scroll", syncTop);
      table.removeEventListener("scroll", syncTable);

      table.removeEventListener("mousedown", mouseDown);
      table.removeEventListener("mouseleave", mouseLeave);
      table.removeEventListener("mouseup", mouseUp);
      table.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <>
      {/* TOP SCROLL */}
      <div className="table-scroll-top" ref={topRef}>
        <div className="table-scroll-top-inner" style={{ width: "1265px" }} />
      </div>

      {/* TABLE */}
      <div
        className={clsx("table-container glass-panel", className)}
        ref={tableRef}
      >
        <table className="table">{children}</table>
      </div>
    </>
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
