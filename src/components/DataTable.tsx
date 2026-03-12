import { useState, useEffect, KeyboardEvent } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ComputedOrder, Order } from '../types';
import { ArrowUpDown, Edit2, Calendar, Package, User, Hash } from 'lucide-react';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends import('@tanstack/react-table').RowData> {
    updateDataById: (id: string, columnId: string, value: unknown) => void;
  }
}

interface DataTableProps {
  data: ComputedOrder[];
  updateDataById: (id: string, columnId: string, value: unknown) => void;
  onEdit: (order: Order) => void;
}

export function DataTable({ data, updateDataById, onEdit }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ComputedOrder>[] = [
    { 
      accessorKey: 'cc', 
      header: () => <div className="flex items-center justify-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Centro Custo</div>,
      cell: (info) => <div className="text-center font-mono text-sm font-medium text-slate-500">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'codigo', 
      header: () => <div className="text-center">Código</div>,
      cell: (info) => <div className="text-center font-mono text-sm font-bold text-blue-600">{info.getValue() as string}</div>
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                status === 'ATENDIDO'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    { 
      accessorKey: 'cliente', 
      header: () => <div className="flex items-center justify-center gap-1.5"><User className="w-3.5 h-3.5" /> Cliente</div>,
      cell: (info) => <div className="text-center font-medium text-slate-900">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'sistema', 
      header: () => <div className="text-center">Sistema</div>,
      cell: (info) => <div className="text-center">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'sonda', 
      header: () => <div className="text-center">Sonda</div>,
      cell: (info) => <div className="text-center">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'produto', 
      header: () => <div className="flex items-center justify-center gap-1.5"><Package className="w-3.5 h-3.5" /> Produto</div>,
      cell: (info) => <div className="text-center text-slate-600">{info.getValue() as string}</div>
    },
    {
      accessorKey: 'qtdSolicitada',
      header: () => <div className="text-center">Qtd Solicitada</div>,
      cell: (info) => <div className="text-center font-semibold text-slate-900">{info.getValue() as number}</div>,
    },
    {
      accessorKey: 'qtdAtendida',
      header: () => <div className="text-center">Atendido</div>,
      cell: ({ getValue, row: { original }, column: { id }, table }) => {
        const initialValue = getValue() as number;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, setValue] = useState(initialValue);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [error, setError] = useState(false);

        const validateAndSave = (val: number) => {
          if (val > original.qtdSolicitada) {
            setError(true);
            return false;
          }
          setError(false);
          table.options.meta?.updateDataById(original.id, id, val);
          return true;
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onBlur = () => {
          if (value > original.qtdSolicitada) {
            setValue(initialValue);
            setError(false);
          } else {
            validateAndSave(value);
          }
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            const success = validateAndSave(value);
            if (success) {
              (e.target as HTMLInputElement).blur();
            }
          }
          if (e.key === 'Escape') {
            setValue(initialValue);
            setError(false);
            (e.target as HTMLInputElement).blur();
          }
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setValue(initialValue);
          setError(false);
        }, [initialValue]);

        const percent = Math.min(100, (value / original.qtdSolicitada) * 100);

        return (
          <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
            <div className="relative group/input flex justify-center">
              <input
                value={value}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setValue(val);
                  setError(val > original.qtdSolicitada);
                }}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                type="number"
                className={`w-20 text-center bg-slate-50 border rounded-md px-3 py-1.5 text-base font-bold focus:outline-none focus:ring-2 transition-all ${
                  error 
                    ? 'border-red-500 focus:ring-red-100 text-red-600' 
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'
                }`}
              />
              {error && (
                <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 animate-in fade-in slide-in-from-bottom-1">
                  Máx: {original.qtdSolicitada}
                </div>
              )}
            </div>
            <div className="h-1 w-full max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'qtdPendente',
      header: () => <div className="text-center">Pendente</div>,
      cell: (info) => {
        const val = info.getValue() as number;
        return (
          <div className={`text-center font-bold ${val > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
            {val}
          </div>
        );
      },
    },
    {
      accessorKey: 'dataNecessidade',
      header: () => <div className="flex items-center justify-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Data Necessidade</div>,
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return <div className="text-center text-slate-500 text-sm">{date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>;
      },
    },
    {
      accessorKey: 'dataAtendimentoInicio',
      header: () => <div className="text-center">Atend. Início</div>,
      cell: ({ getValue, row: { original }, column: { id }, table }) => {
        const initialValue = getValue() as string | null;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, setValue] = useState(initialValue || '');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onBlur = () => {
          table.options.meta?.updateDataById(original.id, id, value || null);
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setValue(initialValue || '');
        }, [initialValue]);

        return (
          <div className="flex justify-center">
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
              className="bg-transparent border-none text-sm text-slate-500 focus:ring-0 p-0 cursor-pointer hover:text-blue-600 transition-colors text-center"
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'dataAtendimentoFinal',
      header: () => <div className="text-center">Atend. Final</div>,
      cell: ({ getValue, row: { original }, column: { id }, table }) => {
        const initialValue = getValue() as string | null;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, setValue] = useState(initialValue || '');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onBlur = () => {
          table.options.meta?.updateDataById(original.id, id, value || null);
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setValue(initialValue || '');
        }, [initialValue]);

        return (
          <div className="flex justify-center">
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
              className="bg-transparent border-none text-sm text-slate-500 focus:ring-0 p-0 cursor-pointer hover:text-blue-600 transition-colors text-center"
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => onEdit(row.original)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            title="Editar Pedido"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateDataById,
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-4 font-bold text-slate-500 uppercase text-xs tracking-widest whitespace-nowrap select-none group text-center"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center justify-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer hover:text-slate-900' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4 whitespace-nowrap align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Package className="w-8 h-8 opacity-20" />
                    <p className="text-sm font-medium">Nenhum registro encontrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
