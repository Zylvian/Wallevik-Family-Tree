import { useCallback, useState } from 'react'
import { FamilyTree } from './components/FamilyTree'
import { PersonDetail } from './components/PersonDetail'
import { PersonEditor } from './components/PersonEditor'
import { useFamilyData } from './hooks/useFamilyData'
import type { Person, PersonInput } from './types/person'

type View = 'tree' | 'editor'

function App() {
  const { people, loading, error, addPerson, updatePerson, deletePerson, resetToFile, exportJson } =
    useFamilyData()

  const [view, setView] = useState<View>('tree')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  const handleSelect = useCallback((person: Person) => {
    setSelectedPerson(person)
  }, [])

  const handleSave = useCallback(
    (input: PersonInput, id?: string) => {
      if (id) {
        updatePerson(id, input)
        setEditingPerson(null)
        setSelectedPerson(null)
      } else {
        const person = addPerson(input)
        setSelectedPerson(person)
      }
    },
    [addPerson, updatePerson]
  )

  const handleEdit = useCallback((person: Person) => {
    setSelectedPerson(null)
    setEditingPerson(person)
    setView('editor')
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('Delete this person? Children will become root nodes.')) {
        deletePerson(id)
        setEditingPerson(null)
        setSelectedPerson(null)
      }
    },
    [deletePerson]
  )

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader" />
        <p>Loading family tree…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-error">
        <p>Failed to load family data: {error}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon">🌳</span>
          <div>
            <h1>Wallevik Family Tree</h1>
            <p className="header-subtitle">{people.length} family members</p>
          </div>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${view === 'tree' ? 'active' : ''}`}
            onClick={() => setView('tree')}
          >
            Tree
          </button>
          <button
            className={`nav-btn ${view === 'editor' ? 'active' : ''}`}
            onClick={() => {
              setView('editor')
              setEditingPerson(null)
            }}
          >
            Editor
          </button>
          <button className="nav-btn" onClick={exportJson} title="Download JSON">
            Export
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              if (confirm('Reset to the original file data? Local edits will be lost.')) {
                resetToFile()
              }
            }}
            title="Reset to file"
          >
            Reset
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'tree' ? (
          <FamilyTree
            people={people}
            selectedId={selectedPerson?.id ?? null}
            onSelect={handleSelect}
          />
        ) : (
          <div className="editor-layout">
            <PersonEditor
              people={people}
              editingPerson={editingPerson}
              onSave={handleSave}
              onCancel={() => setEditingPerson(null)}
              onDelete={handleDelete}
            />
            <aside className="editor-sidebar">
              <h3>All family members</h3>
              <ul className="member-list">
                {people
                  .sort((a, b) => a.birthYear - b.birthYear)
                  .map((p) => (
                    <li key={p.id}>
                      <button
                        className={`member-item ${editingPerson?.id === p.id ? 'active' : ''}`}
                        onClick={() => setEditingPerson(p)}
                      >
                        <span className="member-name">{p.name}</span>
                        <span className="member-year">b. {p.birthYear}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </aside>
          </div>
        )}
      </main>

      {selectedPerson && (
        <PersonDetail
          person={selectedPerson}
          people={people}
          onClose={() => setSelectedPerson(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}

export default App
