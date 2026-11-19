import React, { useMemo } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Inbox,
  Loader2,
} from "lucide-react";

export default function AdminDataTable({
  columns = [],
  data = [],
  loading = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [], // [{ key, label, options: [{ label, value }], value, onChange }]
  sortColumn,
  sortDirection = "asc", // "asc" | "desc"
  onSort,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  bulkActions = [], // [{ label, icon: Icon, onClick, variant }]
  // Pagination
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  emptyTitle = "No records found",
  emptyMessage = "There are no entries matching your current filters or search query.",
  emptyIcon: EmptyIcon = Inbox,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs overflow-hidden transition-colors">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--theme-text-muted)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-gold)] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                aria-label={filter.label}
                className="px-3 py-2 pr-8 text-xs font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-gold)] appearance-none cursor-pointer"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
              />
            </div>
          ))}

          {/* Bulk Actions Menu (when rows are selected) */}
          {selectable && selectedIds.length > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 bg-[var(--theme-gold-surface)] border border-[var(--theme-gold-border)] rounded-xl">
              <span className="text-xs font-bold text-[var(--theme-gold)] px-2">
                {selectedIds.length} selected:
              </span>
              {bulkActions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => act.onClick(selectedIds)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                      act.variant === "danger"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : act.variant === "success"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-bright)] text-black"
                    }`}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--theme-surface-elevated)]/60 border-b border-[var(--theme-border)] text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">
              {selectable && (
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    aria-label="Select all rows"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors cursor-pointer"
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} className="text-[var(--theme-gold)]" />
                    ) : isPartiallySelected ? (
                      <div className="w-4 h-4 rounded bg-[var(--theme-gold)] text-black flex items-center justify-center text-[10px] font-bold">
                        -
                      </div>
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                  className={`py-3 px-4 select-none ${
                    col.sortable ? "cursor-pointer hover:text-[var(--theme-text)]" : ""
                  } ${col.className || ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && sortColumn === col.key && (
                      <span className="text-[var(--theme-gold)]">
                        {sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--theme-border)] text-sm">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {selectable && (
                    <td className="py-3.5 px-4">
                      <div className="w-4 h-4 bg-[var(--theme-surface-elevated)] rounded"></div>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="py-3.5 px-4">
                      <div className="h-4 bg-[var(--theme-surface-elevated)] rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-elevated)] flex items-center justify-center text-[var(--theme-text-muted)] mb-3">
                      <EmptyIcon size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-[var(--theme-text)] mb-1">
                      {emptyTitle}
                    </h4>
                    <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rowIdx) => {
                const rowId = row._id || row.id || rowIdx;
                const isSelected = selectedIds.includes(rowId);
                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-[var(--theme-surface-hover)] transition-colors ${
                      isSelected ? "bg-[var(--theme-gold-surface)]/30" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectRow(rowId)}
                          aria-label={`Select row ${rowId}`}
                          className="text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[var(--theme-gold)]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3.5 px-4 ${col.className || ""}`}>
                        {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      {totalItems > 0 && (
        <div className="p-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--theme-text-muted)]">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-bold text-[var(--theme-text)]">{startRecord}</span> to{" "}
              <span className="font-bold text-[var(--theme-text)]">{endRecord}</span> of{" "}
              <span className="font-bold text-[var(--theme-text)]">{totalItems}</span> records
            </span>
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 ml-4">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          {onPageChange && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(1)}
                disabled={currentPage <= 1}
                aria-label="First page"
                className="p-1.5 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="px-3 py-1 text-xs font-bold text-[var(--theme-text)]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage >= totalPages}
                aria-label="Last page"
                className="p-1.5 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

