import React from 'react';

const ItemModal = ({
  showAddModal,
  editingItem,
  newItem,
  setNewItem,
  handleAddItem,
  handleUpdateItem,
  closeModal
}) => {
  if (!showAddModal) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <button className="close-btn" onClick={closeModal}>×</button>
        </div>
        <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input
              type="text"
              className="form-input"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
              placeholder="Enter item name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              required
              placeholder="Enter category"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-input"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              required
              min="0"
              placeholder="Enter quantity"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
