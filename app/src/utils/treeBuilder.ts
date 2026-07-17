import type { Person, PersonInput, TreeNode } from '../types/person'

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateId(name: string, existingIds: Set<string>): string {
  const base = slugify(name)
  let id = base
  let counter = 2
  while (existingIds.has(id)) {
    id = `${base}-${counter}`
    counter++
  }
  return id
}

export function buildForest(people: Person[]): TreeNode[] {
  const byId = new Map(people.map((p) => [p.id, p]))
  const childrenMap = new Map<string, Person[]>()

  for (const person of people) {
    if (person.parentId && byId.has(person.parentId)) {
      const siblings = childrenMap.get(person.parentId) ?? []
      siblings.push(person)
      childrenMap.set(person.parentId, siblings)
    }
  }

  function buildNode(person: Person): TreeNode {
    const children = (childrenMap.get(person.id) ?? [])
      .sort((a, b) => a.birthYear - b.birthYear)
      .map(buildNode)
    return { person, children }
  }

  const roots = people
    .filter((p) => !p.parentId || !byId.has(p.parentId))
    .sort((a, b) => a.birthYear - b.birthYear)

  return roots.map(buildNode)
}

export function validatePerson(
  input: PersonInput,
  people: Person[],
  editingId?: string
): string | null {
  if (!input.name.trim()) return 'Name is required.'
  if (!input.birthYear || input.birthYear < 1000 || input.birthYear > 2100) {
    return 'Enter a valid birth year.'
  }
  if (input.parentId) {
    if (input.parentId === editingId) return 'A person cannot be their own parent.'
    const parent = people.find((p) => p.id === input.parentId)
    if (!parent) return 'Selected parent does not exist.'
    if (wouldCreateCycle(people, editingId, input.parentId)) {
      return 'This parent would create a cycle in the family tree.'
    }
  }
  return null
}

function wouldCreateCycle(
  people: Person[],
  personId: string | undefined,
  newParentId: string
): boolean {
  if (!personId) return false
  let current: string | null = newParentId
  while (current) {
    if (current === personId) return true
    const parent = people.find((p) => p.id === current)
    current = parent?.parentId ?? null
  }
  return false
}
