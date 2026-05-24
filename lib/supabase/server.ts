
type Row = Record<string, any>

const db = {
  vehicles: [] as Row[],
  reminders: [] as Row[],
  expenses: [] as Row[],
}

const mockUser = { id: 'local-user', email: 'demo@example.com' }

class QueryBuilder {
  table: keyof typeof db
  filters: Array<(row: Row)=>boolean> = []
  constructor(table: keyof typeof db) {
    this.table = table
  }

  select() { return Promise.resolve({ data: db[this.table].filter(r=>this.filters.every(f=>f(r))), error: null }) }
  insert(data: Row | Row[]) {
    const items = Array.isArray(data) ? data : [data]
    items.forEach(item => db[this.table].push({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item,
    }))
    return Promise.resolve({ error: null })
  }
  update(values: Row) {
    const rows = db[this.table].filter(r=>this.filters.every(f=>f(r)))
    rows.forEach(r=>Object.assign(r, values))
    return this
  }
  delete() {
    db[this.table] = db[this.table].filter(r=>!this.filters.every(f=>f(r)))
    return Promise.resolve({ error: null })
  }
  eq(field: string, value: any) {
    this.filters.push(r=>r[field]===value)
    return this
  }
  gte() { return this }
  lte() { return this }
  order() { return this }
  limit() { return this }
  then(resolve:any) {
    return this.select().then(resolve)
  }
}

export function createClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: mockUser } }
      },
      async signInWithPassword() {
        return { error: null }
      },
      async signUp() {
        return { error: null }
      },
      async signOut() {
        return { error: null }
      },
    },
    from(table: keyof typeof db) {
      return new QueryBuilder(table)
    },
  }
}
