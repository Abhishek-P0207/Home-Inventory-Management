import React, { useState, useEffect } from 'react';
import ApiService from '../services/api.js';
import InventoryHeader from './inventory/InventoryHeader.jsx';
import InventoryFilters from './inventory/InventoryFilters.jsx';
import InventoryGrid from './inventory/InventoryGrid.jsx';
import ItemModal from './inventory/ItemModal.jsx';
import UploadModal from './inventory/UploadModal.jsx';
import InvoicesModal from './inventory/InvoicesModal.jsx';
import DraftReviewModal from './inventory/DraftReviewModal.jsx';
import './Inventory.css';

const Inventory = () => {
  // Inventory Items State
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add / Edit Item State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    description: ''
  });

  // Document Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Invoices Modal State
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);

  // Draft Review Modal State
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [activeDraft, setActiveDraft] = useState(null);
  const [draftItems, setDraftItems] = useState([]);
  const [approvingDraft, setApprovingDraft] = useState(false);
  const [draftActionError, setDraftActionError] = useState(null);
  const [draftActionSuccess, setDraftActionSuccess] = useState(null);

  useEffect(() => {
    fetchItems();
    checkPendingDrafts();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
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
      const uniqueCategories = [...new Set(formattedItems.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load inventory items. Please try again.');
      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingDrafts = async () => {
    try {
      const drafts = await ApiService.getPendingDrafts();
      setPendingDrafts(Array.isArray(drafts) ? drafts : []);
    } catch (err) {
      console.error('Error checking pending drafts:', err);
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

  // Add & Edit Handlers
  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await ApiService.addItem({
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        description: newItem.description
      });
      await fetchItems();
      setNewItem({ name: '', category: '', quantity: '', description: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding item:', err);
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
      await fetchItems();
      setNewItem({ name: '', category: '', quantity: '', description: '' });
      setEditingItem(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
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
      await fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setNewItem({ name: '', category: '', quantity: '', description: '' });
  };

  // Upload Document Handlers
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
        message: response.message || 'Document uploaded to S3 with status PENDING.',
        status: response.status || 'PENDING',
        file: response.invoice
      });
      setSelectedFile(null);
      fetchInvoices();
      checkPendingDrafts();
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

  // Invoices & View Handlers
  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    setInvoicesError(null);
    try {
      const data = await ApiService.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
      await checkPendingDrafts();
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

  // Draft Review Handlers
  const handleOpenDraftModal = async (invoiceId) => {
    setDraftActionError(null);
    setDraftActionSuccess(null);
    setApprovingDraft(false);
    try {
      const draftData = await ApiService.getDraftByInvoiceId(invoiceId);
      if (!draftData) {
        alert('Draft data not found for this invoice.');
        return;
      }
      setActiveDraft(draftData);
      setDraftItems(draftData.items ? draftData.items.map(item => ({ ...item })) : []);
      setShowDraftModal(true);
    } catch (err) {
      console.error('Error opening draft modal:', err);
      alert('Failed to load extracted draft: ' + err.message);
    }
  };

  const handleDraftItemChange = (index, field, value) => {
    const updated = [...draftItems];
    updated[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setDraftItems(updated);
  };

  const handleAddDraftItemRow = () => {
    setDraftItems([
      ...draftItems,
      { name: 'New Item', category: 'General', quantity: 1, description: '', price: 0 }
    ]);
  };

  const handleRemoveDraftItemRow = (index) => {
    setDraftItems(draftItems.filter((_, i) => i !== index));
  };

  const handleApproveDraft = async () => {
    if (!activeDraft) return;
    if (draftItems.length === 0) {
      setDraftActionError('Please keep at least one item in the draft to add to inventory.');
      return;
    }

    setApprovingDraft(true);
    setDraftActionError(null);
    setDraftActionSuccess(null);

    try {
      const res = await ApiService.approveDraft(activeDraft._id, {
        items: draftItems,
        vendor: activeDraft.vendor,
        totalAmount: activeDraft.totalAmount
      });
      setDraftActionSuccess(res.message || 'Draft approved and items added to inventory!');
      await fetchItems();
      await fetchInvoices();
      await checkPendingDrafts();

      setTimeout(() => {
        setShowDraftModal(false);
        setActiveDraft(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to approve draft:', err);
      setDraftActionError(err.message || 'Failed to approve draft');
    } finally {
      setApprovingDraft(false);
    }
  };

  const handleCancelDraft = async () => {
    if (!activeDraft) return;
    if (!window.confirm('Are you sure you want to cancel this draft review?')) return;

    setApprovingDraft(true);
    setDraftActionError(null);
    setDraftActionSuccess(null);

    try {
      const res = await ApiService.cancelDraft(activeDraft._id);
      setDraftActionSuccess(res.message || 'Draft review cancelled.');
      await fetchInvoices();
      await checkPendingDrafts();

      setTimeout(() => {
        setShowDraftModal(false);
        setActiveDraft(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to cancel draft:', err);
      setDraftActionError(err.message || 'Failed to cancel draft');
    } finally {
      setApprovingDraft(false);
    }
  };

  const hasReviewAlert = invoices.some(inv => (inv.status || '').toUpperCase() === 'REVIEW') || pendingDrafts.length > 0;

  return (
    <div className="inventory">
      <div className="container">
        <InventoryHeader
          error={error}
          loading={loading}
          setShowUploadModal={setShowUploadModal}
          setShowAddModal={setShowAddModal}
        />

        <InventoryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          handleOpenInvoicesModal={handleOpenInvoicesModal}
          hasReviewAlert={hasReviewAlert}
        />

        <InventoryGrid
          filteredItems={filteredItems}
          loading={loading}
          handleEditItem={handleEditItem}
          handleDeleteItem={handleDeleteItem}
        />

        <ItemModal
          showAddModal={showAddModal}
          editingItem={editingItem}
          newItem={newItem}
          setNewItem={setNewItem}
          handleAddItem={handleAddItem}
          handleUpdateItem={handleUpdateItem}
          closeModal={closeModal}
        />

        <UploadModal
          showUploadModal={showUploadModal}
          closeUploadModal={closeUploadModal}
          handleUploadSubmit={handleUploadSubmit}
          handleFileChange={handleFileChange}
          selectedFile={selectedFile}
          uploading={uploading}
          uploadError={uploadError}
          uploadStatus={uploadStatus}
        />

        <InvoicesModal
          showInvoicesModal={showInvoicesModal}
          closeInvoicesModal={closeInvoicesModal}
          hasReviewAlert={hasReviewAlert}
          invoicesError={invoicesError}
          loadingInvoices={loadingInvoices}
          invoices={invoices}
          handleOpenDraftModal={handleOpenDraftModal}
          handleViewBill={handleViewBill}
        />

        <DraftReviewModal
          showDraftModal={showDraftModal}
          setShowDraftModal={setShowDraftModal}
          activeDraft={activeDraft}
          draftItems={draftItems}
          handleDraftItemChange={handleDraftItemChange}
          handleAddDraftItemRow={handleAddDraftItemRow}
          handleRemoveDraftItemRow={handleRemoveDraftItemRow}
          draftActionError={draftActionError}
          draftActionSuccess={draftActionSuccess}
          approvingDraft={approvingDraft}
          handleCancelDraft={handleCancelDraft}
          handleApproveDraft={handleApproveDraft}
        />
      </div>
    </div>
  );
};

export default Inventory;