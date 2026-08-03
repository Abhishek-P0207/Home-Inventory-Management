import React from 'react';
import { Search, Filter, FileText } from 'lucide-react';

const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  handleOpenInvoicesModal,
  hasReviewAlert
}) => {
  return (
    <div className="inventory-filters">
      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-box">
        <Filter size={20} />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <button
        className="view-invoices-btn"
        onClick={handleOpenInvoicesModal}
      >
        <FileText size={18} />
        View Invoices
        {hasReviewAlert && (
          <span className="btn-review-badge"></span>
        )}
      </button>
    </div>
  );
};

export default InventoryFilters;
