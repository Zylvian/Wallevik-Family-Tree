import { useMemo, useState } from 'react'
import type { Person } from '../types/person'
import { getRelationship } from '../utils/relationship'

interface RelationshipLookupProps {
  people: Person[]
}

export function RelationshipLookup({ people }: RelationshipLookupProps) {
  const sorted = useMemo(
    () => [...people].sort((a, b) => a.name.localeCompare(b.name)),
    [people]
  )

  const [personAId, setPersonAId] = useState(sorted[0]?.id ?? '')
  const [personBId, setPersonBId] = useState(sorted[1]?.id ?? sorted[0]?.id ?? '')

  const personA = people.find((p) => p.id === personAId)
  const personB = people.find((p) => p.id === personBId)

  const result =
    personA && personB ? getRelationship(personA, personB, people) : null

  return (
    <div className="relation-lookup">
      <div className="relation-lookup-header">
        <h2>Relationship lookup</h2>
        <p>
          Order matters: the first person is described relative to the second — “X is Y's …”
        </p>
      </div>

      <div className="relation-selectors">
        <label>
          Person X
          <select value={personAId} onChange={(e) => setPersonAId(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (b. {p.birthYear})
              </option>
            ))}
          </select>
        </label>

        <span className="relation-is">is</span>

        <label>
          Person Y
          <select value={personBId} onChange={(e) => setPersonBId(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (b. {p.birthYear})
              </option>
            ))}
          </select>
        </label>

        <span className="relation-possessive">'s …</span>
      </div>

      {result && personA && personB && personA.id !== personB.id && (
        <div className="relation-result">
          <p className="relation-sentence">
            <span className="relation-person">{personA.name}</span>
            <span className="relation-is-inline"> is </span>
            <span className="relation-person">{personB.name}'s</span>
          </p>
          <p className="relation-role">{result.role}</p>
          <p className="relation-detail">{result.detail}</p>
        </div>
      )}

      {result && personA && personB && personA.id === personB.id && (
        <p className="relation-detail">Choose two different people.</p>
      )}
    </div>
  )
}
