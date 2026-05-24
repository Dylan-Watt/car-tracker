import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { History, Car, DollarSign, Fuel, Wrench, Shield, FileText, Bell, TrendingUp, TrendingDown } from 'lucide-react'
import type { Expense, Vehicle, Reminder } from '@/lib/types'
import { HistoryFilters } from '@/components/history-filters'

interface HistoryItem {
  id: string
  type: 'expense' | 'reminder'
  date: string
  title: string
  subtitle: string
  amount?: number
  vehicleId: string
  vehicleName: string
  expenseType?: string
  reminderType?: string
}

async function getHistoryData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { items: [], vehicles: [], stats: { totalExpenses: 0, avgMonthly: 0, topCategory: '' } }

  const [expensesResult, remindersResult, vehiclesResult] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('reminders').select('*').eq('user_id', user.id).eq('is_completed', true).order('due_date', { ascending: false }),
    supabase.from('vehicles').select('id, name').eq('user_id', user.id),
  ])

  const expenses = (expensesResult.data || []) as Expense[]
  const completedReminders = (remindersResult.data || []) as Reminder[]
  const vehicles = (vehiclesResult.data || []) as Pick<Vehicle, 'id' | 'name'>[]

  const vehicleMap = new Map(vehicles.map(v => [v.id, v.name]))

  // Convert to unified history items
  const expenseItems: HistoryItem[] = expenses.map(e => ({
    id: e.id,
    type: 'expense' as const,
    date: e.date,
    title: formatExpenseType(e.type),
    subtitle: e.description || e.vendor || '',
    amount: Number(e.amount),
    vehicleId: e.vehicle_id,
    vehicleName: vehicleMap.get(e.vehicle_id) || 'Unknown',
    expenseType: e.type,
  }))

  const reminderItems: HistoryItem[] = completedReminders.map(r => ({
    id: r.id,
    type: 'reminder' as const,
    date: r.due_date,
    title: r.title,
    subtitle: `${formatReminderType(r.type)} completed`,
    vehicleId: r.vehicle_id,
    vehicleName: vehicleMap.get(r.vehicle_id) || 'Unknown',
    reminderType: r.type,
  }))

  const items = [...expenseItems, ...reminderItems].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const monthsWithData = new Set(expenses.map(e => e.date.substring(0, 7))).size || 1
  const avgMonthly = totalExpenses / monthsWithData

  // Find top category
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  return { 
    items, 
    vehicles, 
    stats: { 
      totalExpenses, 
      avgMonthly, 
      topCategory: formatExpenseType(topCategory) 
    } 
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

function formatReminderType(type: string) {
  const labels: Record<string, string> = {
    wof: 'WOF',
    registration: 'Registration',
    insurance: 'Insurance',
    service: 'Service',
    custom: 'Custom',
  }
  return labels[type] || type
}

function getItemIcon(item: HistoryItem) {
  if (item.type === 'reminder') {
    return <Bell className="h-4 w-4" />
  }
  switch (item.expenseType) {
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

export default async function HistoryPage() {
  const { items, vehicles, stats } = await getHistoryData()

  // Group items by month
  const itemsByMonth = items.reduce((acc, item) => {
    const date = new Date(item.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(item)
    return acc
  }, {} as Record<string, HistoryItem[]>)

  const sortedMonths = Object.keys(itemsByMonth).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            Complete record of all vehicle activity
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgMonthly.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topCategory}</div>
            <p className="text-xs text-muted-foreground">Highest spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <HistoryFilters vehicles={vehicles} />

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No history yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Your vehicle expenses and completed reminders will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((monthKey) => {
            const monthItems = itemsByMonth[monthKey]
            const [year, month] = monthKey.split('-')
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
            const monthExpenses = monthItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + (i.amount || 0), 0)

            return (
              <Card key={monthKey}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{monthName}</CardTitle>
                    <CardDescription>{monthItems.length} activities</CardDescription>
                  </div>
                  {monthExpenses > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold">${monthExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground">expenses</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
                    
                    <div className="space-y-4">
                      {monthItems.map((item, index) => (
                        <div key={item.id} className="relative flex gap-4 pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-card ${
                            item.type === 'reminder' ? 'border-primary' : 'border-muted'
                          }`}>
                            {getItemIcon(item)}
                          </div>
                          
                          <div className="flex-1 rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{item.title}</p>
                                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                                    item.type === 'reminder' 
                                      ? 'bg-primary/10 text-primary' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {item.type === 'reminder' ? 'Completed' : item.expenseType}
                                  </span>
                                </div>
                                {item.subtitle && (
                                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                )}
                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                  <Car className="h-3 w-3" />
                                  {item.vehicleName}
                                </div>
                              </div>
                              <div className="text-right">
                                {item.amount !== undefined && (
                                  <p className="font-medium">${item.amount.toFixed(2)}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString('en-NZ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
