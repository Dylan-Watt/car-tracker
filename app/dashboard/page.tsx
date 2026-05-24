import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Car, Bell, DollarSign, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Vehicle, Reminder, Expense } from '@/lib/types'

async function getDashboardData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { vehicles: [], reminders: [], expenses: [], totalExpenses: 0 }

  const [vehiclesResult, remindersResult, expensesResult] = await Promise.all([
    supabase.from('vehicles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('reminders').select('*').eq('user_id', user.id).eq('is_completed', false).order('due_date', { ascending: true }).limit(5),
    supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
  ])

  const vehicles = (vehiclesResult.data || []) as Vehicle[]
  const reminders = (remindersResult.data || []) as Reminder[]
  const expenses = (expensesResult.data || []) as Expense[]

  // Calculate total expenses for current year
  const currentYear = new Date().getFullYear()
  const { data: yearExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('date', `${currentYear}-01-01`)
    .lte('date', `${currentYear}-12-31`)

  const totalExpenses = (yearExpenses || []).reduce((sum, e) => sum + Number(e.amount), 0)

  return { vehicles, reminders, expenses, totalExpenses }
}

function getDaysUntil(dateString: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getReminderStatus(daysUntil: number) {
  if (daysUntil < 0) return { label: 'Overdue', color: 'text-destructive', bgColor: 'bg-destructive/10' }
  if (daysUntil <= 7) return { label: 'Due soon', color: 'text-warning', bgColor: 'bg-warning/10' }
  if (daysUntil <= 30) return { label: 'Upcoming', color: 'text-primary', bgColor: 'bg-primary/10' }
  return { label: 'On track', color: 'text-muted-foreground', bgColor: 'bg-muted' }
}

export default async function DashboardPage() {
  const { vehicles, reminders, expenses, totalExpenses } = await getDashboardData()

  const upcomingReminders = reminders.map(r => ({
    ...r,
    daysUntil: getDaysUntil(r.due_date),
    status: getReminderStatus(getDaysUntil(r.due_date))
  }))

  const urgentReminders = upcomingReminders.filter(r => r.daysUntil <= 14)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your vehicles and upcoming tasks
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">
              {urgentReminders.length} due within 14 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Year Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total for {new Date().getFullYear()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {urgentReminders.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <CheckCircle className="h-4 w-4 text-primary" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {urgentReminders.length > 0 ? 'Action Needed' : 'All Good'}
            </div>
            <p className="text-xs text-muted-foreground">
              {urgentReminders.length > 0 
                ? `${urgentReminders.length} items need attention`
                : 'No urgent items'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Tasks due soon</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/reminders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No upcoming reminders</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href="/dashboard/reminders/new">Add a reminder</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${reminder.status.bgColor}`}>
                        <Bell className={`h-4 w-4 ${reminder.status.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {reminder.type.toUpperCase()} - {new Date(reminder.due_date).toLocaleDateString('en-NZ')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${reminder.status.color}`}>
                      {reminder.daysUntil < 0 
                        ? `${Math.abs(reminder.daysUntil)} days overdue`
                        : reminder.daysUntil === 0 
                          ? 'Today'
                          : `${reminder.daysUntil} days`
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/expenses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No expenses recorded</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href="/dashboard/expenses/new">Add an expense</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{expense.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.description || expense.vendor || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(expense.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString('en-NZ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicles List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Vehicles</CardTitle>
            <CardDescription>Manage your registered vehicles</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/vehicles">Manage</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Car className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No vehicles registered yet</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/dashboard/vehicles/new">Add your first vehicle</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.slice(0, 6).map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="group rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{vehicle.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'No details'}
                      </p>
                      {vehicle.registration_plate && (
                        <p className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          {vehicle.registration_plate}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
