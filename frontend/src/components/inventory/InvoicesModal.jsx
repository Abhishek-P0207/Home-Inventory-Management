import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

const InvoicesModal = ({
  showInvoicesModal,
  closeInvoicesModal,
  hasReviewAlert,
  invoicesError,
  loadingInvoices,
  invoices,
  handleOpenDraftModal,
  handleViewBill
}) => {
  if (!showInvoicesModal) return null;

  return (
    <div className="modal-overlay" onClick={closeInvoicesModal}>
      <div className="modal invoices-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Uploaded Invoices & Documents</h2>
          <button className="close-btn" onClick={closeInvoicesModal}>×</button>
        </div>

        <div className="invoices-modal-content">
          {/* Alert banner if draft review is pending */}
          {hasReviewAlert && (
            <div className="review-alert-banner">
              <div className="review-alert-content">
                <AlertTriangle size={24} color="#9333ea" />
                <div>
                  <div className="review-alert-title">Draft Invoice Review Required</div>
                  <div className="review-alert-sub">Invoice is parsed. Please review the extracted draft before finalizing.</div>
                </div>
              </div>
            </div>
          )}

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
              {invoices.map((inv) => {
                const statusUpper = (inv.status || 'PENDING').toUpperCase();
                const isReview = statusUpper === 'REVIEW';

                return (
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
                        <span className={`status-badge status-${statusUpper}`}>
                          {statusUpper}
                        </span>
                      </div>
                    </div>
                    <div className="invoice-actions-cell">
                      {isReview && (
                        <button
                          className="btn-review-draft"
                          onClick={() => handleOpenDraftModal(inv._id || inv.customId)}
                        >
                          Review Draft
                        </button>
                      )}
                      <button
                        className="btn-view-bill"
                        onClick={() => handleViewBill(inv._id || inv.customId)}
                      >
                        View File
                      </button>
                    </div>
                  </div>
                );
              })}
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
  );
};

export default InvoicesModal;
