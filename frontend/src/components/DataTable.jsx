export default function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.28em] text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-4 font-medium">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {rows.map((row, index) => (
              <tr key={row.id ?? index} className="hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 align-top">{column.render ? column.render(row[column.key], row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}