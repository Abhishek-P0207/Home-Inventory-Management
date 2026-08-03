import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadModal = ({
  showUploadModal,
  closeUploadModal,
  handleUploadSubmit,
  handleFileChange,
  selectedFile,
  uploading,
  uploadError,
  uploadStatus
}) => {
  if (!showUploadModal) return null;

  return (
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
                  Status: <code>{uploadStatus.status}</code> (Saved in S3/DB, awaiting worker pickup)
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
  );
};

export default UploadModal;
