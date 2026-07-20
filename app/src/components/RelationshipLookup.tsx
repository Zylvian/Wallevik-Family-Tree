import { useMemo, useState } from 'react'
import type { Person } from '../types/person'
import { getRelationship } from '../utils/relationship'
import { PersonSearch } from './PersonSearch'

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
          Search by name to find people quickly.
        </p>
      </div>

      <div className="relation-selectors">
        <PersonSearch
          label="Person X"
          people={people}
          value={personAId}
          onChange={setPersonAId}
          placeholder="Search person X…"
        />

        <span className="relation-is">is</span>

        <PersonSearch
          label="Person Y"
          people={people}
          value={personBId}
          onChange={setPersonBId}
          placeholder="Search person Y…"
        />

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
