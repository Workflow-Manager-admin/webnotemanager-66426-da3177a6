import React, { useState } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // State for notes and selection
  const [notes, setNotes] = useState([
    {
      id: "1",
      title: "Welcome Note",
      content: "This is your first note.\nClick + to create more!",
      created: new Date(),
      updated: new Date(),
    },
  ]);
  const [selectedId, setSelectedId] = useState(notes[0].id);
  const [isEditing, setIsEditing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Handlers
  // PUBLIC_INTERFACE
  function selectNote(id) {
    setSelectedId(id);
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleCreate() {
    const id = Date.now().toString();
    const newNote = {
      id,
      title: "Untitled Note",
      content: "",
      created: new Date(),
      updated: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(id);
    setIsEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleDelete(id) {
    if (window.confirm("Delete this note?")) {
      let idx = notes.findIndex((n) => n.id === id);
      let newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (id === selectedId) {
        // Pick next or first note
        if (newNotes.length > 0) {
          let next = newNotes[idx] || newNotes[0];
          setSelectedId(next.id);
        } else {
          setSelectedId(null);
        }
        setIsEditing(false);
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleEdit() {
    setIsEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleSave(edits) {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              title: (edits.title || "Untitled Note").trim(),
              content: edits.content || "",
              updated: new Date(),
            }
          : n
      )
    );
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setIsEditing(false);
  }

  // Find selected note
  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="notes-app-root" style={{ background: "var(--notes-bg, #f7f7f9)", minHeight: "100vh" }}>
      <TopBar
        onMenuToggle={() => setShowSidebar((v) => !v)}
        onNew={handleCreate}
        canNew={true}
      />
      <div className="notes-main-container">
        <Sidebar
          visible={showSidebar}
          notes={notes}
          selectedId={selectedId}
          onSelect={selectNote}
          onDelete={handleDelete}
        />

        <main className="notes-main-content" aria-label="Note details">
          {selectedNote ? (
            isEditing ? (
              <NoteEditor
                key={selectedNote.id}
                note={selectedNote}
                onSave={handleSave}
                onCancel={handleCancelEdit}
              />
            ) : (
              <NoteDetail
                note={selectedNote}
                onEdit={handleEdit}
                onDelete={() => handleDelete(selectedNote.id)}
              />
            )
          ) : (
            <div className="notes-placeholder">
              <div className="notes-placeholder-msg">
                No note selected. Click '＋' to create a note.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function TopBar({ onMenuToggle, onNew, canNew }) {
  return (
    <nav className="notes-topbar" role="banner">
      <span className="notes-menu-btn" onClick={onMenuToggle} tabIndex={0} aria-label="Toggle Sidebar">
        ☰
      </span>
      <span className="notes-title-logo">
        <span role="img" aria-label="notes" className="notes-logo">
          📝
        </span>
        Notes
      </span>
      <button
        className="btn notes-primary"
        onClick={onNew}
        title="Create note"
        aria-label="Create note"
        disabled={!canNew}
      >
        ＋
      </button>
    </nav>
  );
}

// PUBLIC_INTERFACE
function Sidebar({ visible, notes, selectedId, onSelect, onDelete }) {
  return (
    <aside className={`notes-sidebar${visible ? "" : " hidden"}`}>
      <div className="notes-sidebar-header">My Notes</div>
      <ul className="notes-list">
        {notes.map((note) => (
          <li
            key={note.id}
            className={note.id === selectedId ? "selected" : ""}
            tabIndex={0}
            onClick={() => onSelect(note.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSelect(note.id);
            }}
          >
            <div className="notes-list-title">{note.title || "Untitled"}</div>
            <span
              className="notes-delete-btn"
              title="Delete note"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onDelete(note.id);
              }}
            >
              ×
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
function NoteDetail({ note, onEdit, onDelete }) {
  return (
    <div className="notes-detail">
      <div className="notes-detail-header">
        <h2 className="notes-detail-title">{note.title || "Untitled"}</h2>
        <div className="notes-actions">
          <button className="btn notes-accent" onClick={onEdit} title="Edit">
            Edit
          </button>
          <button className="btn notes-secondary" onClick={onDelete} title="Delete">
            Delete
          </button>
        </div>
      </div>
      <div className="notes-detail-meta">
        {formatDateDisplay(note.updated || note.created)}
      </div>
      <div className="notes-detail-content">
        {note.content ? note.content.split("\n").map((line, i) =>
          <div key={i}>{line}</div>
        ) : <span style={{ color: "#999" }}>No content.</span>}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ title, content });
  }

  return (
    <form className="notes-editor" onSubmit={handleSubmit} autoComplete="off">
      <input
        className="notes-input-title"
        type="text"
        value={title}
        placeholder="Title"
        maxLength={100}
        onChange={(e) => setTitle(e.target.value)}
        required
        aria-label="Note Title"
      />
      <textarea
        className="notes-input-content"
        value={content}
        placeholder="Write your note..."
        onChange={(e) => setContent(e.target.value)}
        rows={12}
        aria-label="Note Content"
      />
      <div className="notes-editor-actions">
        <button type="button" className="btn notes-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn notes-primary">
          Save
        </button>
      </div>
    </form>
  );
}

// UTILS
function formatDateDisplay(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return (
    <span style={{ fontSize: "0.92em", color: "#bbb" }}>
      {d.toLocaleString()}
    </span>
  );
}

export default App;
