import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Person, PersonInput } from '../types/person'

export interface PersonRow {
  id: string
  name: string
  birth_year: number
  death_date: string | null
  parent_id: string | null
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured')
  }
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return client
}

export function rowToPerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    birthYear: row.birth_year,
    deathDate: row.death_date,
    parentId: row.parent_id,
  }
}

export function inputToRow(person: PersonInput & { id: string }): PersonRow {
  return {
    id: person.id,
    name: person.name.trim(),
    birth_year: person.birthYear,
    death_date: person.deathDate,
    parent_id: person.parentId,
  }
}

export async function fetchAllPeople(): Promise<Person[]> {
  const { data, error } = await getSupabase()
    .from('people')
    .select('*')
    .order('birth_year', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as PersonRow[]).map(rowToPerson)
}

export async function insertPerson(person: PersonInput & { id: string }): Promise<Person> {
  const { data, error } = await getSupabase()
    .from('people')
    .insert(inputToRow(person))
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToPerson(data as PersonRow)
}

export async function updatePersonInDb(
  id: string,
  person: PersonInput & { id: string }
): Promise<Person> {
  const { data, error } = await getSupabase()
    .from('people')
    .update(inputToRow(person))
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToPerson(data as PersonRow)
}

export async function deletePersonFromDb(id: string): Promise<void> {
  const { error: childError } = await getSupabase()
    .from('people')
    .update({ parent_id: null })
    .eq('parent_id', id)

  if (childError) throw new Error(childError.message)

  const { error } = await getSupabase().from('people').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
