import { useCallback, useEffect, useState } from 'react'
import type { Person, PersonInput } from '../types/person'
import { generateId } from '../utils/treeBuilder'

const STORAGE_KEY = 'wallevik-family-tree-data'

async function loadInitialData(): Promise<Person[]> {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as Person[]
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const response = await fetch(`${import.meta.env.BASE_URL}data/family.json`)
  if (!response.ok) throw new Error('Failed to load family data')
  return response.json() as Promise<Person[]>
}

export function useFamilyData() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
      .then(setPeople)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const persist = useCallback((next: Person[]) => {
    setPeople(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next, null, 2))
  }, [])

  const addPerson = useCallback(
    (input: PersonInput) => {
      const existingIds = new Set(people.map((p) => p.id))
      const id = input.id ?? generateId(input.name, existingIds)
      const person: Person = { ...input, id, name: input.name.trim() }
      persist([...people, person])
      return person
    },
    [people, persist]
  )

  const updatePerson = useCallback(
    (id: string, input: PersonInput) => {
      const next = people.map((p) =>
        p.id === id ? { ...p, ...input, id, name: input.name.trim() } : p
      )
      persist(next)
    },
    [people, persist]
  )

  const deletePerson = useCallback(
    (id: string) => {
      const next = people
        .filter((p) => p.id !== id)
        .map((p) => (p.parentId === id ? { ...p, parentId: null } : p))
      persist(next)
    },
    [people, persist]
  )

  const resetToFile = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY)
    const data = await fetch(`${import.meta.env.BASE_URL}data/family.json`).then((r) =>
      r.json()
    ) as Person[]
    setPeople(data)
  }, [])

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(people, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'family.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [people])

  return {
    people,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    resetToFile,
    exportJson,
  }
}
