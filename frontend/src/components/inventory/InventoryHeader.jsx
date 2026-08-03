import React from 'react';
import { Upload, Plus } from 'lucide-react';

const InventoryHeader = ({
  error,
  loading,
  setShowUploadModal,
  setShowAddModal
}) => {
  return (
    <div className="inventory-header">
      <div>
        <h1>Inventory Management</h1>
        <p>Manage your complete inventory with detailed tracking</p>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="header-actions">
        <button
          className="btn btn-secondary btn-upload"
          onClick={() => setShowUploadModal(true)}
          disabled={loading}
        >
          <Upload size={16} />
          Upload Document
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        >
          <Plus size={16} />
          {loading ? 'Loading...' : 'Add Item'}
        </button>
      </div>
    </div>
  );
};

export default InventoryHeader;
