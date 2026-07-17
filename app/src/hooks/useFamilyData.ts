import { useCallback, useEffect, useState } from 'react'
import type { Person, PersonInput } from '../types/person'
import { generateId } from '../utils/treeBuilder'
import {
  deletePersonFromDb,
  fetchAllPeople,
  insertPerson,
  isSupabaseConfigured,
  updatePersonInDb,
} from '../lib/supabase'

async function fetchFallbackData(): Promise<Person[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/family.json`)
  if (!response.ok) throw new Error('Failed to load family data')
  return response.json() as Promise<Person[]>
}

export function useFamilyData() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadPeople = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = isSupabaseConfigured ? await fetchAllPeople() : await fetchFallbackData()
      setPeople(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPeople()
  }, [loadPeople])

  const addPerson = useCallback(
    async (input: PersonInput): Promise<Person> => {
      if (!isSupabaseConfigured) {
        throw new Error('Database not configured — see README for Supabase setup')
      }

      setSaving(true)
      try {
        const existingIds = new Set(people.map((p) => p.id))
        const id = input.id ?? generateId(input.name, existingIds)
        const person = await insertPerson({ ...input, id })
        setPeople((prev) => [...prev, person])
        return person
      } finally {
        setSaving(false)
      }
    },
    [people]
  )

  const updatePerson = useCallback(async (id: string, input: PersonInput): Promise<Person> => {
    if (!isSupabaseConfigured) {
      throw new Error('Database not configured — see README for Supabase setup')
    }

    setSaving(true)
    try {
      const person = await updatePersonInDb(id, { ...input, id })
      setPeople((prev) => prev.map((p) => (p.id === id ? person : p)))
      return person
    } finally {
      setSaving(false)
    }
  }, [])

  const deletePerson = useCallback(async (id: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      throw new Error('Database not configured — see README for Supabase setup')
    }

    setSaving(true)
    try {
      await deletePersonFromDb(id)
      setPeople((prev) =>
        prev
          .filter((p) => p.id !== id)
          .map((p) => (p.parentId === id ? { ...p, parentId: null } : p))
      )
    } finally {
      setSaving(false)
    }
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
    saving,
    isSupabaseConfigured,
    addPerson,
    updatePerson,
    deletePerson,
    refresh: loadPeople,
    exportJson,
  }
}
