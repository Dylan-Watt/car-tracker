import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DollarSign, Plus, Fuel, Wrench, Shield, FileText } from 'lucide-react'
import type { Expense, Vehicle } from '@/lib/types'
import { ExpenseActions } from '@/components/expense-actions'

async function getExpensesData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { expenses: [], vehicles: [], totals: { total: 0, fuel: 0, maintenance: 0, other: 0 } }

  const [expensesResult, vehiclesResult] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('vehicles').select('id, name').eq('user_id', user.id),
  ])

  const expenses = (expensesResult.data || []) as Expense[]
  const vehicles = (vehiclesResult.data || []) as Pick<Vehicle, 'id' | 'name'>[]

  // Calculate totals for current year
  const currentYear = new Date().getFullYear()
  const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear)
  
  const totals = {
    total: yearExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
    fuel: yearExpenses.filter(e => e.type === 'fuel').reduce((sum, e) => sum + Number(e.amount), 0),
    maintenance: yearExpenses.filter(e => ['repair', 'maintenance'].includes(e.type)).reduce((sum, e) => sum + Number(e.amount), 0),
    other: yearExpenses.filter(e => !['fuel', 'repair', 'maintenance'].includes(e.type)).reduce((sum, e) => sum + Number(e.amount), 0),
  }

  return { expenses, vehicles, totals }
}

function getExpenseIcon(type: string) {
  switch (type) {
    case 'fuel':
      return <Fuel className="h-4 w-4" />
    case 'repair':
    case 'maintenance':
      return <Wrench className="h-4 w-4" />
    case 'insurance':
    case 'registration':
    case 'wof':
      return <Shield className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

function formatExpenseType(type: string) {
  const labels: Record<string, string> = {
    fuel: 'Fuel',
    repair: 'Repair',
    maintenance: 'Maintenance',
    insurance: 'Insurance',
    registration: 'Registration',
    wof: 'WOF',
    other: 'Other',
  }
  return labels[type] || type
}

export default async function ExpensesPage() {
  const { expenses, vehicles, totals } = await getExpensesData()

  const vehicleMap = new Map(vehicles.map(v => [v.id, v.name]))

  // Group expenses by month
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  const sortedMonths = Object.keys(expensesByMonth).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track fuel, repairs, and maintenance costs
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total ({new Date().getFullYear()})</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.fuel.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.maintenance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Other</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.other.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No expenses yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Start tracking your vehicle expenses to see your costs over time.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((monthKey) => {
            const monthExpenses = expensesByMonth[monthKey]
            const [year, month] = monthKey.split('-')
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
            const monthTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

            return (
              <Card key={monthKey}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{monthName}</CardTitle>
                    <CardDescription>{monthExpenses.length} transactions</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${monthTotal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            {getExpenseIcon(expense.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{formatExpenseType(expense.type)}</p>
                              <span className="text-sm text-muted-foreground">
                                {vehicleMap.get(expense.vehicle_id) || 'Unknown'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {expense.description || expense.vendor || new Date(expense.date).toLocaleDateString('en-NZ')}
                            </p>
                            {expense.odometer && (
                              <p className="text-xs text-muted-foreground">
                                {expense.odometer.toLocaleString()} km
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">${Number(expense.amount).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString('en-NZ')}
                            </p>
                          </div>
                          <ExpenseActions expense={expense} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
