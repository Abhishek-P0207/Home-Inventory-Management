import React from 'react';
import { Package, Edit, Trash2 } from 'lucide-react';

const InventoryGrid = ({
  filteredItems,
  loading,
  handleEditItem,
  handleDeleteItem
}) => {
  if (loading) {
    return (
      <div className="loading-state">
        <Package size={48} />
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="empty-state">
        <Package size={64} />
        <h3>No items found</h3>
        <p>Try adjusting your search or add a new item to get started.</p>
      </div>
    );
  }

  return (
    <div className="inventory-grid">
      {filteredItems.map((item) => (
        <div key={item.id} className="inventory-card">
          <div className="card-icon">
            <Package size={32} />
          </div>
          <div className="card-content">
            <h3>{item.name}</h3>
            <p className="category">{item.category}</p>
            <p className="description">{item.description}</p>
            <div className="quantity-badge">
              <span className={`quantity ${item.quantity <= 5 ? 'low' : ''}`}>
                {item.quantity} units
              </span>
            </div>
          </div>
          <div className="card-actions">
            <button
              className="action-btn edit"
              onClick={() => handleEditItem(item)}
              disabled={loading}
            >
              <Edit size={16} />
            </button>
            <button
              className="action-btn delete"
              onClick={() => handleDeleteItem(item)}
              disabled={loading}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryGrid;
