import type { Person } from '../types/person'

interface PersonDetailProps {
  person: Person
  people: Person[]
  onClose: () => void
  onEdit: (person: Person) => void
}

export function PersonDetail({ person, people, onClose, onEdit }: PersonDetailProps) {
  const parent = person.parentId ? people.find((p) => p.id === person.parentId) : null
  const children = people.filter((p) => p.parentId === person.id)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>{person.name}</h2>
        <dl className="detail-list">
          <dt>Birth year</dt>
          <dd>{person.birthYear}</dd>
          <dt>Status</dt>
          <dd>{person.deathDate ? `Deceased (${person.deathDate})` : 'Living'}</dd>
          <dt>Parent</dt>
          <dd>{parent?.name ?? 'Unknown / not in tree'}</dd>
          {children.length > 0 && (
            <>
              <dt>Children</dt>
              <dd>
                <ul>
                  {children.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => onEdit(person)}>
            Edit
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
