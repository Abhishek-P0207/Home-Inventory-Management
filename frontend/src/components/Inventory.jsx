import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, Filter, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import ApiService from '../services/api.js';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    description: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    console.log('🔄 Fetching items...');
    
    try {
      const data = await ApiService.getAllItems();
      
      const formattedItems = data.map(item => ({
        id: item._id || Math.random().toString(36).substring(2, 9),
        name: item.name,
        category: item.roomName,
        quantity: item.quantity,
        description: item.description || 'No description available'
      }));
      
      setItems(formattedItems);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(formattedItems.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load inventory items. Please try again.');
      
      // Don't use fallback dummy data - let's see the real issue
      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    
    try {
      const result = await ApiService.addItem({
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        description: newItem.description
      });
      
      // Refresh the list after successful addition
      await fetchItems();
      
      setNewItem({ name: '', category: '', quantity: '', description: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      description: item.description
    });
    setShowAddModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await ApiService.updateItem(
        editingItem.name,
        editingItem.category,
        {
          name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
          description: newItem.description
        }
      );
      
      // Refresh the list after successful update
      await fetchItems();
      
      setNewItem({ name: '', category: '', quantity: '', description: '' });
      setEditingItem(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
      
      // Fallback: update local state for demo
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name: newItem.name,
              category: newItem.category,
              quantity: parseInt(newItem.quantity),
              description: newItem.description
            }
          : item
      );
      setItems(updatedItems);
      
      setNewItem({ name: '', category: '', quantity: '', description: '' });
      setEditingItem(null);
      setShowAddModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    setError(null);
    
    try {
      await ApiService.deleteItem(item.name, item.category);
      
      // Refresh the list after successful deletion
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item. Please try again.');
      
      // Fallback: remove from local state for demo
      setItems(items.filter(i => i.id !== item.id));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setNewItem({ name: '', category: '', quantity: '', description: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please select a JPG, PNG, or PDF document.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setUploadStatus(null);
    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadStatus(null);

    try {
      const response = await ApiService.uploadDocument(selectedFile);
      setUploadStatus({
        message: response.message || 'Document uploaded successfully to AWS S3. Processing initiated.',
        status: response.status || 'processing_started',
        file: response.file
      });
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadError(null);
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    setInvoicesError(null);
    try {
      const data = await ApiService.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoicesError('Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleOpenInvoicesModal = () => {
    setShowInvoicesModal(true);
    fetchInvoices();
  };

  const closeInvoicesModal = () => {
    setShowInvoicesModal(false);
  };

  const handleViewBill = async (invoiceId) => {
    try {
      await ApiService.viewInvoiceFile(invoiceId);
    } catch (err) {
      alert('Could not open document: ' + err.message);
    }
  };

  return (
    <div className="inventory">
      <div className="container">
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
              {categories.map(category => (
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
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <Package size={48} />
            <p>Loading inventory...</p>
          </div>
        )}

        <div className="inventory-grid">
          {filteredItems.map(item => (
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

        {filteredItems.length === 0 && !loading && (
          <div className="empty-state">
            <Package size={64} />
            <h3>No items found</h3>
            <p>Try adjusting your search or add a new item to get started.</p>
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
              <p>Debug info:</p>
              <p>Items count: {items.length}</p>
              <p>Filtered items count: {filteredItems.length}</p>
              <p>Categories: {categories.join(', ') || 'None'}</p>
            </div>
          </div>
        )}

        {showAddModal && (
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
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
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
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
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
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
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
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
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
        )}

        {showUploadModal && (
          <div className="modal-overlay" onClick={closeUploadModal}>
            <div className="modal upload-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Upload Document / Invoice</h2>
                <button className="close-btn" onClick={closeUploadModal}>×</button>
              </div>
              <form onSubmit={handleUploadSubmit}>
                <div className="upload-dropzone">
                  <FileText size={48} className="upload-icon" />
                  <p className="dropzone-text">Select invoice, receipt, or inventory document</p>
                  <p className="dropzone-hint">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                  
                  <input
                    type="file"
                    id="document-upload"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                  <label htmlFor="document-upload" className="btn btn-secondary select-file-btn">
                    Browse File
                  </label>
                </div>

                {selectedFile && (
                  <div className="selected-file-card">
                    <FileText size={24} />
                    <div className="file-info">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="upload-alert error">
                    <AlertCircle size={18} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadStatus && (
                  <div className="upload-alert success">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>{uploadStatus.message}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                        Status: <code>{uploadStatus.status}</code> (Saved in DB, pending processing)
                      </p>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeUploadModal}>
                    {uploadStatus ? 'Close' : 'Cancel'}
                  </button>
                  {!uploadStatus && (
                    <button type="submit" className="btn btn-primary" disabled={!selectedFile || uploading}>
                      {uploading ? 'Uploading...' : 'Upload & Save'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {showInvoicesModal && (
          <div className="modal-overlay" onClick={closeInvoicesModal}>
            <div className="modal invoices-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Uploaded Invoices & Documents</h2>
                <button className="close-btn" onClick={closeInvoicesModal}>×</button>
              </div>

              <div className="invoices-modal-content">
                {invoicesError && <div className="upload-alert error">{invoicesError}</div>}

                {loadingInvoices ? (
                  <div className="loading-state">
                    <FileText size={40} />
                    <p>Loading invoices...</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <FileText size={48} />
                    <h3>No invoices uploaded yet</h3>
                    <p>Upload receipts or bill documents to view them here.</p>
                  </div>
                ) : (
                  <div className="invoices-list">
                    {invoices.map((inv) => (
                      <div key={inv._id || inv.customId} className="invoice-item-card">
                        <div className="invoice-item-icon">
                          <FileText size={24} />
                        </div>
                        <div className="invoice-item-details">
                          <span className="invoice-name">{inv.originalName}</span>
                          <span className="invoice-meta">
                            Uploaded: {new Date(inv.createdAt).toLocaleDateString()} • {(inv.size / 1024).toFixed(1)} KB
                          </span>
                          <div className="invoice-status-row">
                            <span className={`status-badge status-${inv.status || 'pending'}`}>
                              Processing: {inv.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <button 
                          className="btn-view-bill"
                          onClick={() => handleViewBill(inv._id || inv.customId)}
                        >
                          View Bill
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ padding: '0 24px 24px' }}>
                <button className="btn btn-secondary" onClick={closeInvoicesModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;