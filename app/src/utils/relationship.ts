import type { Person } from '../types/person'

function getParent(person: Person, byId: Map<string, Person>): Person | null {
  if (!person.parentId) return null
  return byId.get(person.parentId) ?? null
}

function areSiblings(a: Person, b: Person): boolean {
  return !!a.parentId && a.parentId === b.parentId
}

/** How many generations `ancestor` is above `person` (1 = parent, 2 = grandparent). */
function generationsAbove(person: Person, ancestor: Person, byId: Map<string, Person>): number {
  let current: Person | null = person
  let steps = 0
  while (current) {
    if (current.id === ancestor.id) return steps
    current = getParent(current, byId)
    steps++
  }
  return -1
}

function greatPrefix(count: number): string {
  if (count <= 0) return ''
  if (count === 1) return 'Great-'
  return `Great-${'great-'.repeat(count - 1)}`
}

function linealUpRole(steps: number): string {
  if (steps === 1) return 'parent'
  if (steps === 2) return 'grandparent'
  return `${greatPrefix(steps - 2)}grandparent`.toLowerCase()
}

function linealDownRole(steps: number): string {
  if (steps === 1) return 'child'
  if (steps === 2) return 'grandchild'
  return `${greatPrefix(steps - 2)}grandchild`.toLowerCase()
}

function auntUncleRole(greatness: number): string {
  if (greatness === 0) return 'aunt / uncle'
  return `${greatPrefix(greatness)}aunt / ${greatPrefix(greatness)}uncle`.toLowerCase()
}

function nieceNephewRole(greatness: number): string {
  if (greatness === 0) return 'niece / nephew'
  return `${greatPrefix(greatness)}niece / ${greatPrefix(greatness)}nephew`.toLowerCase()
}

function cousinRole(degree: number, removal: number): string {
  const ordinal =
    degree === 1 ? '1st' : degree === 2 ? '2nd' : degree === 3 ? '3rd' : `${degree}th`
  const base = `${ordinal} cousin`
  if (removal === 0) return base
  if (removal === 1) return `${base} once removed`
  if (removal === 2) return `${base} twice removed`
  return `${base} ${removal} times removed`
}

function auntUncleGreatness(
  candidate: Person,
  person: Person,
  byId: Map<string, Person>
): number | null {
  let ancestor = getParent(person, byId)
  let depth = 0

  while (ancestor) {
    if (areSiblings(candidate, ancestor)) return depth
    ancestor = getParent(ancestor, byId)
    depth++
  }

  return null
}

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

function findLowestCommonAncestor(
  personA: Person,
  personB: Person,
  byId: Map<string, Person>
): { lca: Person; stepsA: number; stepsB: number } | null {
  const chainA = ancestorChain(personA.id, byId)
  const indexInB = new Map(ancestorChain(personB.id, byId).map((id, index) => [id, index]))

  for (let i = 0; i < chainA.length; i++) {
    const j = indexInB.get(chainA[i])
    if (j !== undefined) {
      const lca = byId.get(chainA[i])
      if (!lca) return null
      return { lca, stepsA: i, stepsB: j }
    }
  }

  return null
}

export interface RelationshipResult {
  /** What person A is to person B — used in “A is B's …” */
  role: string
  detail: string
}

/**
 * Describes what `personA` is to `personB` (order matters).
 * Example: Heidi → Jarle gives role "aunt / uncle".
 */
export function getRelationship(
  personA: Person,
  personB: Person,
  people: Person[]
): RelationshipResult {
  if (personA.id === personB.id) {
    return {
      role: 'same person',
      detail: 'Choose two different people to compare.',
    }
  }

  const byId = new Map(people.map((p) => [p.id, p]))

  const aIsAncestorOfB = generationsAbove(personB, personA, byId)
  if (aIsAncestorOfB > 0) {
    const role = linealUpRole(aIsAncestorOfB)
    return {
      role,
      detail: `They share a direct line through ${personA.name}, ${aIsAncestorOfB} generation${
        aIsAncestorOfB > 1 ? 's' : ''
      } above ${personB.name}.`,
    }
  }

  const aIsDescendantOfB = generationsAbove(personA, personB, byId)
  if (aIsDescendantOfB > 0) {
    const role = linealDownRole(aIsDescendantOfB)
    return {
      role,
      detail: `They share a direct line through ${personB.name}, ${aIsDescendantOfB} generation${
        aIsDescendantOfB > 1 ? 's' : ''
      } below ${personB.name}.`,
    }
  }

  if (areSiblings(personA, personB)) {
    const parent = personA.parentId ? byId.get(personA.parentId) : null
    return {
      role: 'sibling',
      detail: parent
        ? `They share a parent: ${parent.name}.`
        : 'They share the same parent in the tree.',
    }
  }

  const aIsAuntUncleOfB = auntUncleGreatness(personA, personB, byId)
  if (aIsAuntUncleOfB !== null) {
    const role = auntUncleRole(aIsAuntUncleOfB)
    const parent = getParent(personB, byId)
    return {
      role,
      detail: parent
        ? `${personA.name} is a sibling of ${personB.name}'s parent, ${parent.name}.`
        : `${personA.name} is on the parent's generation relative to ${personB.name}.`,
    }
  }

  const bIsAuntUncleOfA = auntUncleGreatness(personB, personA, byId)
  if (bIsAuntUncleOfA !== null) {
    const role = nieceNephewRole(bIsAuntUncleOfA)
    const parent = getParent(personA, byId)
    return {
      role,
      detail: parent
        ? `${personB.name} is a sibling of ${personA.name}'s parent, ${parent.name}.`
        : `${personB.name} is on the parent's generation relative to ${personA.name}.`,
    }
  }

  const lcaResult = findLowestCommonAncestor(personA, personB, byId)
  if (!lcaResult) {
    return {
      role: 'not related',
      detail: 'No shared ancestor appears in this family tree.',
    }
  }

  const { lca, stepsA, stepsB } = lcaResult
  const degree = Math.min(stepsA, stepsB) - 1
  const removal = Math.abs(stepsA - stepsB)
  const role = cousinRole(degree, removal)
  const shared =
    Math.min(stepsA, stepsB) === 2
      ? 'grandparent'
      : `${greatPrefix(Math.min(stepsA, stepsB) - 2)}grandparent`.toLowerCase()

  return {
    role,
    detail: `They are related through ${lca.name} (${shared}).`,
  }
}
