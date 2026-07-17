import type { Person } from '../types/person'

export function computeGenerationMap(people: Person[]): Map<string, number> {
  const byId = new Map(people.map((p) => [p.id, p]))
  const generations = new Map<string, number>()

  for (const person of people) {
    if (!person.parentId || !byId.has(person.parentId)) {
      generations.set(person.id, 0)
    }
  }

  let changed = true
  while (changed) {
    changed = false
    for (const person of people) {
      if (!person.parentId || !byId.has(person.parentId)) continue
      const parentGen = generations.get(person.parentId)
      if (parentGen === undefined) continue
      const nextGen = parentGen + 1
      const current = generations.get(person.id)
      if (current === undefined || current < nextGen) {
        generations.set(person.id, nextGen)
        changed = true
      }
    }
  }

  for (const person of people) {
    if (!generations.has(person.id)) {
      generations.set(person.id, 0)
    }
  }

  return generations
}

export function getGenerationLabel(generation: number, maxGeneration: number): string {
  const number = generation + 1

  if (generation === 0) return 'Generation 1 — Elders'
  if (generation === maxGeneration) return `Generation ${number} — Youngest`

  return `Generation ${number}`
}

export function getGenerationSubtitle(generation: number): string {
  if (generation === 0) return 'Founders & oldest ancestors'
  if (generation === 1) return 'Siblings appear on the same row'
  if (generation === 2) return 'First cousins share this row'
  if (generation === 3) return 'Second cousins share this row'
  if (generation === 4) return 'Third cousins share this row'
  return `Same-generation relatives (cousins) share this row`
}
