import { useEffect, useState } from 'react'
import type { Person, PersonInput } from '../types/person'
import { validatePerson } from '../utils/treeBuilder'

interface PersonEditorProps {
  people: Person[]
  editingPerson: Person | null
  saving?: boolean
  onSave: (input: PersonInput, id?: string) => void | Promise<void>
  onCancel: () => void
  onDelete?: (id: string) => void | Promise<void>
}

const emptyForm: PersonInput = {
  name: '',
  birthYear: new Date().getFullYear(),
  deathDate: null,
  parentId: null,
}

export function PersonEditor({
  people,
  editingPerson,
  saving = false,
  onSave,
  onCancel,
  onDelete,
}: PersonEditorProps) {
  const [form, setForm] = useState<PersonInput>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingPerson) {
      setForm({
        name: editingPerson.name,
        birthYear: editingPerson.birthYear,
        deathDate: editingPerson.deathDate,
        parentId: editingPerson.parentId,
      })
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [editingPerson])

  const parentOptions = people
    .filter((p) => p.id !== editingPerson?.id)
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validatePerson(form, people, editingPerson?.id)
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      await onSave(form, editingPerson?.id)
      if (!editingPerson) setForm(emptyForm)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <div className="editor-panel">
      <h2>{editingPerson ? 'Edit Person' : 'Add Person'}</h2>
      <form onSubmit={handleSubmit} className="editor-form">
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            required
          />
        </label>

        <label>
          Birth year
          <input
            type="number"
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: parseInt(e.target.value, 10) })}
            min={1000}
            max={2100}
            required
          />
        </label>

        <label>
          Death date <span className="optional">(optional)</span>
          <input
            type="text"
            value={form.deathDate ?? ''}
            onChange={(e) =>
              setForm({ ...form, deathDate: e.target.value.trim() || null })
            }
            placeholder="e.g. 2020 or leave blank if living"
          />
        </label>

        <label>
          Parent
          <select
            value={form.parentId ?? ''}
            onChange={(e) =>
              setForm({ ...form, parentId: e.target.value || null })
            }
          >
            <option value="">No parent (tree root)</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (b. {p.birthYear})
              </option>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          {editingPerson && onDelete && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onDelete(editingPerson.id)}
            >
              Delete
            </button>
          )}
          <div className="form-actions-right">
            {editingPerson && (
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingPerson ? 'Save changes' : 'Add person'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
