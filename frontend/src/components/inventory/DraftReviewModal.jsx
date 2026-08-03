import React from 'react';
import { Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

const DraftReviewModal = ({
  showDraftModal,
  setShowDraftModal,
  activeDraft,
  draftItems,
  handleDraftItemChange,
  handleAddDraftItemRow,
  handleRemoveDraftItemRow,
  draftActionError,
  draftActionSuccess,
  approvingDraft,
  handleCancelDraft,
  handleApproveDraft
}) => {
  if (!showDraftModal || !activeDraft) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowDraftModal(false)}>
      <div className="modal draft-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Review Extracted Draft</h2>
          <button className="close-btn" onClick={() => setShowDraftModal(false)}>×</button>
        </div>

        <div className="draft-modal-body">
          <div className="draft-meta-summary">
            <div className="draft-meta-item">
              <span className="draft-meta-label">Vendor / Store</span>
              <span className="draft-meta-val">{activeDraft.vendor || 'Unknown Vendor'}</span>
            </div>
            <div className="draft-meta-item">
              <span className="draft-meta-label">Invoice Date</span>
              <span className="draft-meta-val">{activeDraft.date || 'N/A'}</span>
            </div>
            <div className="draft-meta-item">
              <span className="draft-meta-label">Total Amount</span>
              <span className="draft-meta-val">₹{(activeDraft.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="draft-items-header">
            <h4>Extracted Items ({draftItems.length})</h4>
            <button className="btn-add-row" onClick={handleAddDraftItemRow}>
              + Add Item Row
            </button>
          </div>

          {draftActionError && (
            <div className="upload-alert error">
              <AlertCircle size={18} />
              <span>{draftActionError}</span>
            </div>
          )}

          {draftActionSuccess && (
            <div className="upload-alert success">
              <CheckCircle2 size={18} />
              <span>{draftActionSuccess}</span>
            </div>
          )}

          <table className="draft-editor-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Item Name</th>
                <th style={{ width: '22%' }}>Category</th>
                <th style={{ width: '15%' }}>Quantity</th>
                <th style={{ width: '25%' }}>Description</th>
                <th style={{ width: '8%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {draftItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      className="draft-input"
                      value={item.name}
                      onChange={(e) => handleDraftItemChange(idx, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="draft-input"
                      value={item.category || item.roomName || ''}
                      onChange={(e) => handleDraftItemChange(idx, 'category', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="draft-input"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleDraftItemChange(idx, 'quantity', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="draft-input"
                      value={item.description || ''}
                      onChange={(e) => handleDraftItemChange(idx, 'description', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-remove-row" onClick={() => handleRemoveDraftItemRow(idx)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-actions" style={{ padding: '0 24px 24px' }}>
          <button
            type="button"
            className="btn-cancel-draft"
            onClick={handleCancelDraft}
            disabled={approvingDraft}
          >
            Cancel / Reject Draft
          </button>
          <button
            type="button"
            className="btn-approve-draft"
            onClick={handleApproveDraft}
            disabled={approvingDraft}
          >
            {approvingDraft ? 'Processing...' : 'Approve & Add to Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftReviewModal;
