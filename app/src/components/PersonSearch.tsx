import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Person } from '../types/person'

interface PersonSearchProps {
  label: string
  people: Person[]
  value: string
  onChange: (personId: string) => void
  placeholder?: string
}

function formatPerson(person: Person): string {
  return `${person.name} (b. ${person.birthYear})`
}

export function PersonSearch({
  label,
  people,
  value,
  onChange,
  placeholder = 'Search by name…',
}: PersonSearchProps) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = people.find((p) => p.id === value) ?? null

  const [query, setQuery] = useState(selected ? formatPerson(selected) : '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    const next = people.find((p) => p.id === value)
    if (next) setQuery(formatPerson(next))
  }, [value, people])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return sorted.slice(0, 8)

    return sorted
      .filter((p) => {
        const haystack = `${p.name} ${p.birthYear}`.toLowerCase()
        return haystack.includes(q) || p.name.toLowerCase().startsWith(q)
      })
      .slice(0, 8)
  }, [people, query])

  useEffect(() => {
    setHighlight(0)
  }, [query, open])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        if (selected) setQuery(formatPerson(selected))
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [selected])

  const pick = (person: Person) => {
    onChange(person.id)
    setQuery(formatPerson(person))
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((h) => Math.min(h + 1, Math.max(matches.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const person = matches[highlight]
      if (person) pick(person)
    } else if (event.key === 'Escape') {
      setOpen(false)
      if (selected) setQuery(formatPerson(selected))
    }
  }

  return (
    <div className="person-search" ref={containerRef}>
      <label className="person-search-label" htmlFor={listId}>
        {label}
      </label>
      <div className="person-search-field">
        <input
          id={listId}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${listId}-list`}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {open && (
          <ul id={`${listId}-list`} className="person-search-list" role="listbox">
            {matches.length === 0 ? (
              <li className="person-search-empty">No matches</li>
            ) : (
              matches.map((person, index) => (
                <li key={person.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={person.id === value}
                    className={`person-search-option ${
                      index === highlight ? 'highlighted' : ''
                    } ${person.id === value ? 'selected' : ''}`}
                    onMouseEnter={() => setHighlight(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(person)}
                  >
                    <span className="person-search-name">{person.name}</span>
                    <span className="person-search-year">b. {person.birthYear}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
