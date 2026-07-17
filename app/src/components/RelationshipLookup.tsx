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
        <p>Choose two people to see how they are related.</p>
      </div>

      <div className="relation-selectors">
        <label>
          Person A
          <select value={personAId} onChange={(e) => setPersonAId(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (b. {p.birthYear})
              </option>
            ))}
          </select>
        </label>

        <span className="relation-and">and</span>

        <label>
          Person B
          <select value={personBId} onChange={(e) => setPersonBId(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (b. {p.birthYear})
              </option>
            ))}
          </select>
        </label>
      </div>

      {result && personA && personB && (
        <div className="relation-result">
          <p className="relation-names">
            {personA.name} <span>↔</span> {personB.name}
          </p>
          <p className="relation-label">{result.label}</p>
          <p className="relation-detail">{result.detail}</p>
        </div>
      )}
    </div>
  )
}
