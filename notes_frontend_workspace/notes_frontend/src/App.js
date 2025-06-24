import React, { useState, useEffect } from "react";
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

  // Theme management
  const getPreferredTheme = () => {
    // Try localStorage, fall back to system, default "light"
    if (window.localStorage) {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark";
    return "light";
  };
  const [theme, setTheme] = useState(getPreferredTheme());

  // On theme change, update data-theme attribute and store preference
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    if (window.localStorage) {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

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
    <div className="notes-app-root" style={{ minHeight: "100vh" }}>
      <TopBar
        onMenuToggle={() => setShowSidebar((v) => !v)}
        onNew={handleCreate}
        canNew={true}
        theme={theme}
        onThemeToggle={toggleTheme}
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

/**
 * PUBLIC_INTERFACE
 * TopBar component renders the navigation bar with menu toggle, brand/logo, new note button, and theme toggle icon.
 */
function TopBar({ onMenuToggle, onNew, canNew, theme, onThemeToggle }) {
  const isDark = theme === "dark";
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
      <span style={{ display: "flex", gap: 8 }}>
        <button
          className="notes-theme-toggle"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onThemeToggle}
          type="button"
        >
          {/* Sun/moon icon (accessible) */}
          {isDark ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: "#F9D949" }}>
              <path d="M6.76 4.84l-1.8-1.79-1.42 1.42 1.79 1.8 1.43-1.43zm10.45 10.45l1.8 1.79 1.42-1.42-1.79-1.8-1.43 1.43zM12 4V1h-1v3h1zm0 19v-3h1v3h-1zm8-7h3v-1h-3v1zm-19 0h3v-1H1v1zm15.24-6.16l1.8-1.79-1.42-1.42-1.79 1.8 1.41 1.41zm-10.45 10.45l-1.8 1.79 1.42 1.42 1.79-1.8-1.41-1.41zM12 7a5 5 0 100 10 5 5 0 000-10z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: "#666" }}>
              <path d="M9.37 5.51A7 7 0 0020 12.12c0 3.71-3 6.72-6.69 6.88A7 7 0 019.37 5.51zM12 3c-.34 0-.67.02-1 .05A9 9 0 1021 13c.03-.33.05-.66.05-1A9 9 0 0012 3z"/>
            </svg>
          )}
        </button>
        <button
          className="btn notes-primary"
          onClick={onNew}
          title="Create note"
          aria-label="Create note"
          disabled={!canNew}
        >
          ＋
        </button>
      </span>
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
