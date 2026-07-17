export interface Person {
  id: string
  name: string
  birthYear: number
  deathDate: string | null
  parentId: string | null
}

export interface TreeNode {
  person: Person
  children: TreeNode[]
}

export type PersonInput = Omit<Person, 'id'> & { id?: string }
