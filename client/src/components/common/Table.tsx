import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

function Table<T extends { id?: number | string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  const getCellValue = (row: T, accessor: Column<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor] as React.ReactNode;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-black text-white">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-left font-semibold ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border-light ${
                  onRowClick ? 'cursor-pointer hover:bg-bg-secondary' : ''
                } ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-bg-secondary'}`}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-4 py-3 ${column.className || ''}`}>
                    {getCellValue(row, column.accessor)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;


