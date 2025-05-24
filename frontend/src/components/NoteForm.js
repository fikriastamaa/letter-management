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
      <h2>{selectedNote ? 'Edit Note' : 'Add New Note'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note Content"
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
              Cancel
            </button>
          )}
          
          <button 
            type="submit" 
            className="button submit-button"
          >
            {selectedNote ? 'Update Note' : 'Add Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
