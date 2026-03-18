import { useState, useEffect, KeyboardEvent, useRef, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ComputedOrder, Order, Category, ItemType } from '../types';
import { ArrowUpDown, Edit2, Package } from 'lucide-react';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends import('@tanstack/react-table').RowData> {
    updateDataById: (id: string, columnId: string, value: unknown) => void;
    selectedRowId: string | null;
    setSelectedRowId: (id: string | null) => void;
    focusNonce: number;
    requestNextFocus: (nextRowId: string) => void;
  }
}

interface EditableCellProps {
  getValue: () => any;
  row: { id: string, original: ComputedOrder };
  column: { id: string };
  table: any;
}

function EditableCell({ getValue, row, column: { id }, table }: EditableCellProps) {
  const initialValue = getValue() as number;
  const [value, setValue] = useState(String(initialValue));
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusNonce = useRef<number>(-1);
  const skipNextBlurSave = useRef(false);

  const { selectedRowId, focusNonce, requestNextFocus, setSelectedRowId } = table.options.meta || {};

  // O foco só acontece se o nonce mudar e formos a linha selecionada
  useEffect(() => {
    if (selectedRowId === row.id && focusNonce > lastFocusNonce.current) {
      lastFocusNonce.current = focusNonce;
      const t = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
          // Garante que a linha focada esteja visível
          inputRef.current.closest('tr')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [selectedRowId, focusNonce, row.id]);

  useEffect(() => {
    // Só atualizamos o valor local se o usuário não estiver editando este campo no momento
    if (document.activeElement !== inputRef.current) {
      setValue(String(initialValue));
      setError(false);
    }
  }, [initialValue]);

  const validateAndSave = (valStr: string) => {
    const val = Number(valStr);
    if (isNaN(val)) return false;

    if (val > row.original.qtdSolicitada) {
      setError(true);
      return false;
    }
    setError(false);
    table.options.meta?.updateDataById(row.original.id, id, val);
    return true;
  };

  const onBlur = () => {
    if (skipNextBlurSave.current) {
      skipNextBlurSave.current = false;
      return;
    }

    const val = Number(value);
    if (val > row.original.qtdSolicitada) {
      setValue(String(initialValue));
      setError(false);
    } else {
      validateAndSave(value);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation(); // Evita bolha para o wrapper da tabela
      
      const rows = table.getRowModel().rows;
      const currentIndex = rows.findIndex((r: any) => r.id === row.id);
      
      let nextRowId = null;
      if (currentIndex !== -1 && currentIndex < rows.length - 1) {
        nextRowId = rows[currentIndex + 1].id;
      }

      const success = validateAndSave(value);
      if (success) {
        skipNextBlurSave.current = true; // Evita salvar de novo no OnBlur
        if (nextRowId) {
          requestNextFocus(nextRowId);
        } else {
          inputRef.current?.blur();
        }
      }
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      setValue(String(initialValue));
      setError(false);
      skipNextBlurSave.current = true;
      inputRef.current?.blur();
    }
  };

  const percent = Math.min(100, (Number(value) / row.original.qtdSolicitada) * 100);

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
      <div className="relative group/input flex justify-center">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            const valStr = e.target.value;
            setValue(valStr);
            const valNum = Number(valStr);
            setError(!isNaN(valNum) && valNum > row.original.qtdSolicitada);
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
            Máx: {row.original.qtdSolicitada}
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
}

interface DateCellProps {
  getValue: () => any;
  row: { original: ComputedOrder };
  column: { id: string };
  table: any;
}

function DateCell({ getValue, row: { original }, column: { id }, table }: DateCellProps) {
  const initialValue = getValue() as string | null;
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.updateDataById(original.id, id, value || null);
  };

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
}

interface DataTableProps {
  data: ComputedOrder[];
  updateDataById: (id: string, columnId: string, value: unknown) => void;
  onEdit: (order: Order) => void;
  density?: 'standard' | 'compact';
  activeCategory?: string;
  typeFilter?: ItemType;
}

export function DataTable({ data, updateDataById, onEdit, density = 'standard', activeCategory, typeFilter }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);

  const requestNextFocus = (nextRowId: string) => {
    setSelectedRowId(nextRowId);
    setFocusNonce(prev => prev + 1);
  };

  const columns: ColumnDef<ComputedOrder>[] = useMemo(() => {
    const allColumns: ColumnDef<ComputedOrder>[] = [
      { 
        accessorKey: 'cc', 
        header: () => <div className="flex flex-col items-center leading-tight"><span>Centro</span><span>Custo</span></div>,
        cell: (info) => <div className="text-center font-mono text-sm font-medium text-slate-500">{info.getValue() as string}</div>
      },
      { 
        accessorKey: 'cliente', 
        header: () => <div className="text-center">Cliente</div>,
        cell: (info) => <div className="text-center font-medium text-slate-900">{info.getValue() as string}</div>
      },
      { 
        accessorKey: 'codigo', 
        header: () => <div className="text-center">Código</div>,
        cell: (info) => <div className="text-center font-mono text-sm font-bold text-blue-600">{info.getValue() as string}</div>
      },
      { 
        accessorKey: 'produto', 
        header: () => <div className="text-center">Produto</div>,
        cell: (info) => <div className="text-center text-slate-600">{info.getValue() as string}</div>
      },
      { 
        accessorKey: 'sistema', 
        header: () => <div className="text-center">Sistema</div>,
        cell: (info) => <div className="text-center">{info.getValue() as string}</div>
      },
      { 
        accessorKey: 'tag', 
        header: () => <div className="text-center">TAG</div>,
        cell: (info) => {
          const order = info.row.original;
          const tooltip = `Sonda: ${order.descricao_sonda || '-'}\nModelo: ${order.modelo || '-'}`;
          return (
            <div className="text-center">
              <span 
                className="text-xs font-semibold text-slate-700 cursor-help border-b border-dotted border-slate-300 hover:text-blue-600 transition-colors"
                title={tooltip}
              >
                {info.getValue() as string || order.sonda || '-'}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'qtdSolicitada',
        header: () => <div className="flex flex-col items-center leading-tight"><span>Qtd</span><span>Solicitada</span></div>,
        cell: (info) => <div className="text-center font-semibold text-slate-900">{info.getValue() as number}</div>,
      },
      {
        accessorKey: 'profundidadeFuro',
        header: () => <div className="flex flex-col items-center leading-tight"><span>Profund.</span><span>(m)</span></div>,
        cell: (info) => {
          const val = info.getValue() as number | undefined;
          return <div className="text-center font-medium text-slate-600">{val ? val : '-'}</div>;
        },
      },
      {
        accessorKey: 'qtdAtendida',
        header: () => <div className="text-center">Atendido</div>,
        cell: (props) => <EditableCell {...props} />,
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
        header: () => <div className="flex flex-col items-center leading-tight"><span>Data</span><span>Necessidade</span></div>,
        cell: (info) => {
          const value = info.getValue() as string;
          if (!value) return <div className="text-center text-slate-400">-</div>;
          const date = new Date(value);
          return <div className="text-center text-slate-500 text-sm">{date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>;
        },
      },
      {
        accessorKey: 'dataAtendimentoInicio',
        header: () => <div className="flex flex-col items-center leading-tight"><span>Atend.</span><span>Início</span></div>,
        cell: (props) => <DateCell {...props} />,
      },
      {
        accessorKey: 'dataAtendimentoFinal',
        header: () => <div className="flex flex-col items-center leading-tight"><span>Atend.</span><span>Final</span></div>,
        cell: (props) => <DateCell {...props} />,
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

    // Remove TAG column if it's a Revestimento category or type filter
    if (activeCategory?.startsWith('Revestimentos') || typeFilter === 'Revestimento') {
      return allColumns.filter(col => ('accessorKey' in col && col.accessorKey !== 'tag') || !('accessorKey' in col));
    }
    
    return allColumns;
  }, [onEdit, activeCategory, typeFilter]);


  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateDataById,
      selectedRowId,
      setSelectedRowId,
      focusNonce,
      requestNextFocus,
    },
  });

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
      <div 
        className="overflow-auto flex-1 relative focus:outline-none" 
        tabIndex={0}
        onKeyDown={(e) => {
          if (!selectedRowId) return;
          const rows = table.getRowModel().rows;
          const currentIndex = rows.findIndex(r => r.id === selectedRowId);
          
          if (e.key === 'ArrowDown' && currentIndex < rows.length - 1) {
            e.preventDefault();
            const nextId = rows[currentIndex + 1].id;
            setSelectedRowId(nextId);
            const nextRow = e.currentTarget.querySelector(`tr[data-row-id="${nextId}"]`) as HTMLElement;
            if (nextRow) nextRow.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            const prevId = rows[currentIndex - 1].id;
            setSelectedRowId(prevId);
            const prevRow = e.currentTarget.querySelector(`tr[data-row-id="${prevId}"]`) as HTMLElement;
            if (prevRow) prevRow.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }
        }}
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-700">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'} font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-widest select-none group text-center`}
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {table.getRowModel().rows.map((row) => {
              const isSelected = row.id === selectedRowId;
              return (
                <tr 
                  key={row.id} 
                  data-row-id={row.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('input, select, button')) return;
                    setSelectedRowId(row.id);
                    e.currentTarget.closest('div[tabIndex]')?.focus();
                  }}
                  className={`transition-colors group cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/80 dark:bg-blue-900/40 ring-1 ring-inset ring-blue-500/50' 
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={`px-5 ${density === 'compact' ? 'py-2' : 'py-4'} whitespace-nowrap align-middle`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
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
