import React from "react";

const NoteItem = ({ note, onSelect, onDelete, isSelected }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "New Note";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Prevent event bubbling for action buttons
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className={`note-item ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="note-header">
        <h3>{note.title}</h3>
        <span className="note-date">
          {formatDate(note.createdAt)}
        </span>
      </div>
      <p className="note-content">{note.content}</p> {/* Changed from 'description' to 'content' */}
      <div className="note-actions">
        <button 
          className="button edit-button" 
          onClick={(e) => handleActionClick(e, onSelect)}
          aria-label="Edit note"
        >
          Edit
        </button>
        <button 
          className="button delete-button" 
          onClick={(e) => handleActionClick(e, onDelete)}
          aria-label="Delete note"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteItem;
