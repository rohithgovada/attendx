import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download } from "lucide-react";

export const DataTable = ({
  columns = [],
  data = [],
  searchKey = "name",
  searchPlaceholder = "Search records...",
  filterKey = "status",
  filterOptions = [],
  pageSize = 10,
  emptyMessage = "No matching records found",
  onExport = null,
  actions = null
}) => {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search logic
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Search match
      const searchMatch = !search || (() => {
        const val = row[searchKey];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(search.toLowerCase());
      })();

      // Filter match
      const filterMatch = selectedFilter === "all" || (() => {
        const val = row[filterKey];
        if (!val) return false;
        return String(val).toLowerCase() === selectedFilter.toLowerCase();
      })();

      return searchMatch && filterMatch;
    });
  }, [data, search, searchKey, selectedFilter, filterKey]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return sortConfig.direction === "asc" ? -1 : 1;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  };

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="filter-toolbar">
        <div className="navbar-search" style={{ width: "auto" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-inputs">
          {filterOptions.length > 0 && (
            <select
              className="form-select"
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", fontSize: "0.85rem" }}
            >
              <option value="all">All Statuses</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {onExport && (
            <button
              onClick={() => onExport(sortedData)}
              className="btn btn-outline btn-sm"
              title="Download CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Table Element */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown size={13} style={{ opacity: sortConfig.key === col.key ? 1 : 0.4 }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: "0 8px", fontWeight: 600, color: "var(--text-main)" }}>
              {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
