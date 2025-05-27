import React from "react";

const NoteForm = ({
  selectedNote,
  title,
  setTitle,
  content,
  setContent,
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="note-form">
      <h2>{selectedNote ? 'Edit Surat' : 'Add New Surat'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Judul Surat</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Surat"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Isi Surat</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Isi Surat"
            rows="5"
          />
        </div>
        
        <div className="form-actions">
          {selectedNote && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="button cancel-button"
            >
              Batal
            </button>
          )}
          
          <button 
            type="submit" 
            className="button submit-button"
          >
            {selectedNote ? 'Update Surat' : 'Add Surat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
