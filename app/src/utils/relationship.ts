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

function ordinal(n: number): string {
  const words = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh']
  return words[n] ?? `${n}th`
}

function greatPrefix(count: number): string {
  if (count <= 0) return ''
  if (count === 1) return 'great-'
  return 'great-'.repeat(count)
}

function describeLineal(descendant: Person, ancestor: Person, steps: number): string {
  if (steps === 1) return `${ancestor.name} is the parent of ${descendant.name}`
  if (steps === 2) return `${ancestor.name} is the grandparent of ${descendant.name}`
  return `${ancestor.name} is the ${greatPrefix(steps - 2)}grandparent of ${descendant.name}`
}

function describeAuntUncle(older: Person, younger: Person, stepsUpFromYounger: number): string {
  if (stepsUpFromYounger === 2) {
    return `${older.name} is the aunt/uncle of ${younger.name}`
  }
  return `${older.name} is the ${greatPrefix(stepsUpFromYounger - 2)}aunt/uncle of ${younger.name}`
}

function describeCousin(degree: number, removal: number): string {
  const base = `${ordinal(degree)} cousins`
  if (removal === 0) return base
  if (removal === 1) return `${base} once removed`
  if (removal === 2) return `${base} twice removed`
  return `${base} ${removal} times removed`
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

  if (stepsA === 0) {
    return {
      label: 'Ancestor',
      detail: describeLineal(personB, personA, stepsB),
    }
  }

  if (stepsB === 0) {
    return {
      label: 'Descendant',
      detail: describeLineal(personA, personB, stepsA),
    }
  }

  if (stepsA === 1 && stepsB === 1) {
    return {
      label: 'Siblings',
      detail: `${personA.name} and ${personB.name} share a parent (${lca.name}).`,
    }
  }

  if (stepsA === 1 && stepsB > 1) {
    return {
      label: 'Aunt / Uncle',
      detail: describeAuntUncle(personA, personB, stepsB),
    }
  }

  if (stepsB === 1 && stepsA > 1) {
    return {
      label: 'Niece / Nephew',
      detail: describeAuntUncle(personB, personA, stepsA),
    }
  }

  const degree = Math.min(stepsA, stepsB) - 1
  const removal = Math.abs(stepsA - stepsB)
  const label = describeCousin(degree, removal)

  const commonAncestorLabel =
    stepsA === 2 && stepsB === 2
      ? 'grandparent'
      : `${greatPrefix(Math.min(stepsA, stepsB) - 2)}grandparent`

  return {
    label,
    detail: `${personA.name} and ${personB.name} are ${label.toLowerCase()} through ${lca.name} (${commonAncestorLabel}).`,
  }
}
