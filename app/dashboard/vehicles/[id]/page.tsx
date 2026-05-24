import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Car, Calendar, DollarSign, Bell, Fuel, Wrench, Plus, Settings } from 'lucide-react'
import type { Vehicle, Reminder, Expense } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getVehicleData(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!vehicle) return null

  const [remindersResult, expensesResult] = await Promise.all([
    supabase
      .from('reminders')
      .select('*')
      .eq('vehicle_id', id)
      .eq('is_completed', false)
      .order('due_date', { ascending: true })
      .limit(5),
    supabase
      .from('expenses')
      .select('*')
      .eq('vehicle_id', id)
      .order('date', { ascending: false })
      .limit(10),
  ])

  const reminders = remindersResult.data || []
  const expenses = expensesResult.data || []

  // Calculate totals
  const { data: allExpenses } = await supabase
    .from('expenses')
    .select('amount, type')
    .eq('vehicle_id', id)

  const totalExpenses = (allExpenses || []).reduce((sum, e) => sum + Number(e.amount), 0)
  const fuelExpenses = (allExpenses || []).filter(e => e.type === 'fuel').reduce((sum, e) => sum + Number(e.amount), 0)
  const maintenanceExpenses = (allExpenses || []).filter(e => ['repair', 'maintenance', 'service'].includes(e.type)).reduce((sum, e) => sum + Number(e.amount), 0)

  return { 
    vehicle: vehicle as Vehicle, 
    reminders: reminders as Reminder[], 
    expenses: expenses as Expense[],
    totalExpenses,
    fuelExpenses,
    maintenanceExpenses
  }
}

function getDaysUntil(dateString: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params
  const data = await getVehicleData(id)

  if (!data) {
    notFound()
  }

  const { vehicle, reminders, expenses, totalExpenses, fuelExpenses, maintenanceExpenses } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/vehicles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{vehicle.name}</h1>
              <p className="text-muted-foreground">
                {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle details'}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Vehicle
          </Link>
        </Button>
      </div>

      {/* Vehicle Info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vehicle.registration_plate && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold font-mono">{vehicle.registration_plate}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Odometer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{vehicle.current_odometer.toLocaleString()} km</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">${totalExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        {vehicle.purchase_price && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Purchase Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">${Number(vehicle.purchase_price).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Expense Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${fuelExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${maintenanceExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Other</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalExpenses - fuelExpenses - maintenanceExpenses).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Due dates for this vehicle</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/dashboard/reminders/new?vehicle=${vehicle.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No upcoming reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const daysUntil = getDaysUntil(reminder.due_date)
                  const isOverdue = daysUntil < 0
                  const isDueSoon = daysUntil <= 14
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className={`h-4 w-4 ${isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(reminder.due_date).toLocaleDateString('en-NZ')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'}`}>
                        {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d`}
                      </span>
                    </div>
                  )
                })}
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
            <Button size="sm" asChild>
              <Link href={`/dashboard/expenses/new?vehicle=${vehicle.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No expenses recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {expense.type === 'fuel' ? (
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{expense.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('en-NZ')}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">${Number(expense.amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Details */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>Full details for this vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.make && (
              <div>
                <dt className="text-sm text-muted-foreground">Make</dt>
                <dd className="font-medium">{vehicle.make}</dd>
              </div>
            )}
            {vehicle.model && (
              <div>
                <dt className="text-sm text-muted-foreground">Model</dt>
                <dd className="font-medium">{vehicle.model}</dd>
              </div>
            )}
            {vehicle.year && (
              <div>
                <dt className="text-sm text-muted-foreground">Year</dt>
                <dd className="font-medium">{vehicle.year}</dd>
              </div>
            )}
            {vehicle.color && (
              <div>
                <dt className="text-sm text-muted-foreground">Color</dt>
                <dd className="font-medium capitalize">{vehicle.color}</dd>
              </div>
            )}
            {vehicle.vin && (
              <div>
                <dt className="text-sm text-muted-foreground">VIN</dt>
                <dd className="font-medium font-mono text-sm">{vehicle.vin}</dd>
              </div>
            )}
            {vehicle.purchase_date && (
              <div>
                <dt className="text-sm text-muted-foreground">Purchase Date</dt>
                <dd className="font-medium">{new Date(vehicle.purchase_date).toLocaleDateString('en-NZ')}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
