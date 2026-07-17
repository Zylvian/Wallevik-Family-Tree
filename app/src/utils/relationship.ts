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

function cousinLabel(degree: number, removal: number): string {
  const ordinal =
    degree === 1 ? '1st' : degree === 2 ? '2nd' : degree === 3 ? '3rd' : `${degree}th`
  const base = `${ordinal} cousin`
  if (removal === 0) return base
  if (removal === 1) return `${base} once removed`
  if (removal === 2) return `${base} twice removed`
  return `${base} ${removal} times removed`
}

/** If `candidate` is aunt/uncle of `person`, return greatness (0 = aunt, 1 = great-aunt, …). */
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

  const stepsDown = generationsAbove(personB, personA, byId)
  if (stepsDown > 0) {
    const label = linealUpLabel(stepsDown)
    return {
      label,
      detail: `${personA.name} is the ${label.toLowerCase()} of ${personB.name}.`,
    }
  }

  const stepsUp = generationsAbove(personA, personB, byId)
  if (stepsUp > 0) {
    const label = linealDownLabel(stepsUp)
    return {
      label,
      detail: `${personA.name} is the ${label.toLowerCase()} of ${personB.name}.`,
    }
  }

  if (areSiblings(personA, personB)) {
    const parent = personA.parentId ? byId.get(personA.parentId) : null
    return {
      label: 'Sibling',
      detail: parent
        ? `${personA.name} and ${personB.name} are siblings through ${parent.name}.`
        : `${personA.name} and ${personB.name} are siblings.`,
    }
  }

  const aAuntOfB = auntUncleGreatness(personA, personB, byId)
  if (aAuntOfB !== null) {
    const label = auntUncleLabel(aAuntOfB)
    return {
      label,
      detail: `${personA.name} is the ${label.toLowerCase()} of ${personB.name}.`,
    }
  }

  const bAuntOfA = auntUncleGreatness(personB, personA, byId)
  if (bAuntOfA !== null) {
    const label = auntUncleLabel(bAuntOfA)
    return {
      label,
      detail: `${personB.name} is the ${label.toLowerCase()} of ${personA.name}.`,
    }
  }

  const lcaResult = findLowestCommonAncestor(personA, personB, byId)
  if (!lcaResult) {
    return {
      label: 'Not related',
      detail: 'No shared ancestor was found in this family tree.',
    }
  }

  const { lca, stepsA, stepsB } = lcaResult
  const degree = Math.min(stepsA, stepsB) - 1
  const removal = Math.abs(stepsA - stepsB)
  const label = cousinLabel(degree, removal)
  const shared =
    stepsA === 2 && stepsB === 2
      ? 'grandparent'
      : `${greatPrefix(Math.min(stepsA, stepsB) - 2)}grandparent`.toLowerCase()

  return {
    label,
    detail: `${personA.name} and ${personB.name} are ${label} through ${lca.name} (${shared}).`,
  }
}
