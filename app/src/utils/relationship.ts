import type { Person } from '../types/person'

function ancestorChain(personId: string, byId: Map<string, Person>): string[] {
  const chain: string[] = []
  let current: string | null = personId
  const visited = new Set<string>()

  while (current && !visited.has(current)) {
    visited.add(current)
    chain.push(current)
    const person = byId.get(current)
    current = person?.parentId && byId.has(person.parentId) ? person.parentId : null
  }

  return chain
}

function greatPrefix(count: number): string {
  if (count <= 0) return ''
  if (count === 1) return 'Great-'
  return `Great-${'great-'.repeat(count - 1)}`
}

function linealUpLabel(steps: number): string {
  if (steps === 1) return 'Parent'
  if (steps === 2) return 'Grandparent'
  return `${greatPrefix(steps - 2)}grandparent`
}

function linealDownLabel(steps: number): string {
  if (steps === 1) return 'Child'
  if (steps === 2) return 'Grandchild'
  return `${greatPrefix(steps - 2)}grandchild`
}

function auntUncleLabel(greatness: number): string {
  if (greatness === 0) return 'Aunt / Uncle'
  return `${greatPrefix(greatness)}aunt / ${greatPrefix(greatness)}uncle`
}

function nieceNephewLabel(greatness: number): string {
  if (greatness === 0) return 'Niece / Nephew'
  return `${greatPrefix(greatness)}niece / ${greatPrefix(greatness)}nephew`
}

function cousinLabel(degree: number, removal: number): string {
  const ordinal =
    degree === 1 ? '1st' : degree === 2 ? '2nd' : degree === 3 ? '3rd' : `${degree}th`
  const base = `${ordinal} cousin`
  if (removal === 0) return base
  if (removal === 1) return `${base} once removed`
  if (removal === 2) return `${base} twice removed`
  return `${base} ${removal} times removed`
}

function commonAncestorTerm(steps: number): string {
  if (steps === 1) return 'parent'
  if (steps === 2) return 'grandparent'
  return `${greatPrefix(steps - 2)}grandparent`.toLowerCase()
}

function labelFromAtoB(stepsA: number, stepsB: number): string {
  if (stepsA === 0) return linealUpLabel(stepsB)
  if (stepsB === 0) return linealDownLabel(stepsA)
  if (stepsA === 1 && stepsB === 1) return 'Sibling'

  if (stepsA === 1 && stepsB > 1) {
    return auntUncleLabel(stepsB - 2)
  }

  if (stepsB === 1 && stepsA > 1) {
    return nieceNephewLabel(stepsA - 2)
  }

  const degree = Math.min(stepsA, stepsB) - 1
  const removal = Math.abs(stepsA - stepsB)
  return cousinLabel(degree, removal)
}

function detailFromAtoB(
  personA: Person,
  personB: Person,
  stepsA: number,
  stepsB: number,
  lca: Person
): string {
  const label = labelFromAtoB(stepsA, stepsB).toLowerCase()

  if (stepsA === 0) {
    return `${personA.name} is the ${label} of ${personB.name}.`
  }

  if (stepsB === 0) {
    return `${personA.name} is the ${label} of ${personB.name}.`
  }

  if (stepsA === 1 && stepsB === 1) {
    return `${personA.name} and ${personB.name} are siblings through ${lca.name}.`
  }

  if (stepsA === 1 || stepsB === 1) {
    return `${personA.name} is the ${label} of ${personB.name}.`
  }

  const shared = commonAncestorTerm(Math.min(stepsA, stepsB))
  return `${personA.name} is ${personB.name}'s ${label} through ${lca.name} (${shared}).`
}

export interface RelationshipResult {
  label: string
  detail: string
}

export function getRelationship(
  personA: Person,
  personB: Person,
  people: Person[]
): RelationshipResult {
  if (personA.id === personB.id) {
    return { label: 'Same person', detail: `${personA.name} is the same person.` }
  }

  const byId = new Map(people.map((p) => [p.id, p]))
  const chainA = ancestorChain(personA.id, byId)
  const chainB = ancestorChain(personB.id, byId)
  const indexInB = new Map(chainB.map((id, index) => [id, index]))

  let stepsA = -1
  let stepsB = -1
  for (let i = 0; i < chainA.length; i++) {
    const j = indexInB.get(chainA[i])
    if (j !== undefined) {
      stepsA = i
      stepsB = j
      break
    }
  }

  if (stepsA === -1) {
    return {
      label: 'Not related',
      detail: 'No shared ancestor was found in this family tree.',
    }
  }

  const lca = byId.get(chainA[stepsA])!
  const label = labelFromAtoB(stepsA, stepsB)

  return {
    label,
    detail: detailFromAtoB(personA, personB, stepsA, stepsB, lca),
  }
}
