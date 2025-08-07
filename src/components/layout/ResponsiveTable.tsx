import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from './ResponsiveProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface ResponsiveTableColumn {
  key: string;
  title: string;
  width?: string;
  priority: 'high' | 'medium' | 'low'; // Para ocultar colunas no mobile
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface ResponsiveTableProps {
  data: any[];
  columns: ResponsiveTableColumn[];
  className?: string;
  variant?: 'default' | 'cards' | 'minimal';
  selectable?: boolean;
  expandable?: boolean;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  className,
  variant = 'default',
  selectable = false,
  expandable = false,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum item encontrado'
}) => {
  const { isMobile, screenSize } = useResponsive();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filtrar colunas baseado na prioridade e tamanho da tela
  const getVisibleColumns = () => {
    if (screenSize === 'mobile') {
      return columns.filter(col => col.priority === 'high');
    }
    if (screenSize === 'tablet') {
      return columns.filter(col => col.priority !== 'low');
    }
    return columns;
  };

  const visibleColumns = getVisibleColumns();
  const hiddenColumns = columns.filter(col => !visibleColumns.includes(col));

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (selectedRows.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  // Renderização em cards para mobile
  if (isMobile && variant !== 'minimal') {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((row, index) => (
          <Card 
            key={index}
            className={cn(
              'transition-all duration-200',
              onRowClick && 'cursor-pointer hover:shadow-md',
              selectedRows.has(index) && 'ring-2 ring-primary'
            )}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Colunas de alta prioridade */}
                {visibleColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-3">
                      {column.title}:
                    </span>
                    <span className="text-sm text-right min-w-0 flex-1">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}

                {/* Expandir para mostrar colunas ocultas */}
                {hiddenColumns.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(index);
                      }}
                    >
                      {expandedRows.has(index) ? (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Mostrar mais ({hiddenColumns.length} campos)
                        </>
                      )}
                    </Button>

                    {expandedRows.has(index) && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        {hiddenColumns.map((column) => (
                          <div key={column.key} className="flex justify-between items-start">
                            <span className="text-xs font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-3">
                              {column.title}:
                            </span>
                            <span className="text-xs text-right min-w-0 flex-1">
                              {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Ações de seleção */}
                {selectable && (
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant={selectedRows.has(index) ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowSelection(index);
                      }}
                    >
                      {selectedRows.has(index) ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {data.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Renderização em tabela para desktop/tablet
  return (
    <div className={cn('table-responsive', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(data.map((_, i) => i)));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                />
              </th>
            )}
            {visibleColumns.map((column) => (
              <th 
                key={column.key} 
                className="p-3 text-left font-medium text-muted-foreground"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
            {expandable && hiddenColumns.length > 0 && (
              <th className="p-3 text-left font-medium text-muted-foreground w-12">
                <Filter className="w-4 h-4" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <React.Fragment key={index}>
              <tr 
                className={cn(
                  'border-b border-border hover:bg-muted/50 transition-colors',
                  onRowClick && 'cursor-pointer',
                  selectedRows.has(index) && 'bg-primary/5'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedRows.has(index)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRowSelection(index);
                      }}
                    />
                  </td>
                )}
                {visibleColumns.map((column) => (
                  <td key={column.key} className="p-3">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {expandable && hiddenColumns.length > 0 && (
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(index);
                      }}
                    >
                      {expandedRows.has(index) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </td>
                )}
              </tr>
              
              {/* Linha expandida com dados ocultos */}
              {expandable && expandedRows.has(index) && hiddenColumns.length > 0 && (
                <tr className="bg-muted/20">
                  <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + 1} className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {hiddenColumns.map((column) => (
                        <div key={column.key}>
                          <span className="text-xs font-medium text-muted-foreground block">
                            {column.title}
                          </span>
                          <span className="text-sm">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};