import React from 'react';
import { Inbox } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}
interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
}
const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500/20"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-navy-400">Loading data...</p>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-2xl bg-navy-800/50 mb-4">
          <Inbox className="w-10 h-10 text-navy-500" />
        </div>
        <p className="text-navy-300 font-medium">{emptyMessage}</p>
        <p className="text-sm text-navy-500 mt-1">Add some records to see them here</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="min-w-full">
        <thead>
          <tr className="bg-navy-800/50 border-b border-white/5">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-semibold text-navy-300 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="bg-navy-800/30 hover:bg-navy-800/50 transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-navy-100">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
