import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Bell, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import type { Reminder, Vehicle } from '@/lib/types'
import { ReminderActions } from '@/components/reminder-actions'

async function getRemindersData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { reminders: [], vehicles: [] }

  const [remindersResult, vehiclesResult] = await Promise.all([
    supabase.from('reminders').select('*').eq('user_id', user.id).order('due_date', { ascending: true }),
    supabase.from('vehicles').select('id, name').eq('user_id', user.id),
  ])

  return {
    reminders: (remindersResult.data || []) as Reminder[],
    vehicles: (vehiclesResult.data || []) as Pick<Vehicle, 'id' | 'name'>[],
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

function getReminderTypeLabel(type: string) {
  const labels: Record<string, string> = {
    wof: 'WOF',
    registration: 'Registration',
    insurance: 'Insurance',
    service: 'Service',
    custom: 'Custom',
  }
  return labels[type] || type
}

export default async function RemindersPage() {
  const { reminders, vehicles } = await getRemindersData()

  const vehicleMap = new Map(vehicles.map(v => [v.id, v.name]))

  const activeReminders = reminders.filter(r => !r.is_completed)
  const completedReminders = reminders.filter(r => r.is_completed)

  const overdueReminders = activeReminders.filter(r => getDaysUntil(r.due_date) < 0)
  const upcomingReminders = activeReminders.filter(r => {
    const days = getDaysUntil(r.due_date)
    return days >= 0 && days <= 30
  })
  const laterReminders = activeReminders.filter(r => getDaysUntil(r.due_date) > 30)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">
            Track upcoming WOF, registration, and service dates
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reminders/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Reminder
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueReminders.length}</div>
            <p className="text-xs text-muted-foreground">need immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReminders.length}</div>
            <p className="text-xs text-muted-foreground">within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReminders.length}</div>
            <p className="text-xs text-muted-foreground">this year</p>
          </CardContent>
        </Card>
      </div>

      {activeReminders.length === 0 && completedReminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No reminders yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Add reminders for WOF, registration, insurance, and service dates.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/reminders/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Reminder
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overdue */}
          {overdueReminders.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue
                </CardTitle>
                <CardDescription>These items need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueReminders.map((reminder) => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      vehicleName={vehicleMap.get(reminder.vehicle_id)}
                      daysUntil={getDaysUntil(reminder.due_date)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming */}
          {upcomingReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Due Soon
                </CardTitle>
                <CardDescription>Within the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      vehicleName={vehicleMap.get(reminder.vehicle_id)}
                      daysUntil={getDaysUntil(reminder.due_date)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Later */}
          {laterReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Later</CardTitle>
                <CardDescription>More than 30 days away</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {laterReminders.map((reminder) => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      vehicleName={vehicleMap.get(reminder.vehicle_id)}
                      daysUntil={getDaysUntil(reminder.due_date)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed */}
          {completedReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Completed
                </CardTitle>
                <CardDescription>Past reminders marked as done</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedReminders.slice(0, 10).map((reminder) => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      vehicleName={vehicleMap.get(reminder.vehicle_id)}
                      daysUntil={getDaysUntil(reminder.due_date)}
                      isCompleted
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function ReminderItem({ 
  reminder, 
  vehicleName, 
  daysUntil,
  isCompleted = false 
}: { 
  reminder: Reminder
  vehicleName?: string
  daysUntil: number
  isCompleted?: boolean
}) {
  const isOverdue = daysUntil < 0 && !isCompleted
  const isDueSoon = daysUntil <= 14 && daysUntil >= 0 && !isCompleted

  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-2 ${
          isCompleted ? 'bg-primary/10' : isOverdue ? 'bg-destructive/10' : isDueSoon ? 'bg-warning/10' : 'bg-muted'
        }`}>
          <Bell className={`h-4 w-4 ${
            isCompleted ? 'text-primary' : isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'
          }`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={`font-medium ${isCompleted ? 'line-through' : ''}`}>{reminder.title}</p>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
              {getReminderTypeLabel(reminder.type)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {vehicleName || 'Unknown vehicle'} - {new Date(reminder.due_date).toLocaleDateString('en-NZ')}
          </p>
          {reminder.notes && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{reminder.notes}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!isCompleted && (
          <span className={`text-sm font-medium ${
            isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'
          }`}>
            {isOverdue 
              ? `${Math.abs(daysUntil)} days overdue`
              : daysUntil === 0 
                ? 'Today'
                : `${daysUntil} days`
            }
          </span>
        )}
        <ReminderActions reminder={reminder} />
      </div>
    </div>
  )
}
