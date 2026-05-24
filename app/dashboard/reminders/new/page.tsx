'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { ArrowLeft, Bell, Loader2 } from 'lucide-react'
import type { Vehicle, ReminderType } from '@/lib/types'

const reminderTypes: { value: ReminderType; label: string }[] = [
  { value: 'wof', label: 'Warrant of Fitness (WOF)' },
  { value: 'registration', label: 'Registration' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'service', label: 'Service' },
  { value: 'custom', label: 'Custom' },
]

export default function NewReminderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedVehicle = searchParams.get('vehicle')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle || '')
  const [selectedType, setSelectedType] = useState<ReminderType>('wof')

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      setVehicles(data || [])
      if (data && data.length > 0 && !preselectedVehicle) {
        setSelectedVehicle(data[0].id)
      }
    }

    loadVehicles()
  }, [preselectedVehicle])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setIsLoading(false)
      return
    }

    if (!selectedVehicle) {
      setError('Please select a vehicle')
      setIsLoading(false)
      return
    }

    const reminderData = {
      user_id: user.id,
      vehicle_id: selectedVehicle,
      type: selectedType,
      title: formData.get('title') as string,
      due_date: formData.get('due_date') as string,
      notes: formData.get('notes') as string || null,
      notification_days: parseInt(formData.get('notification_days') as string) || 14,
    }

    const { error: insertError } = await supabase.from('reminders').insert(reminderData)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard/reminders')
    router.refresh()
  }

  const getDefaultTitle = (type: ReminderType, vehicleName?: string) => {
    const titles: Record<ReminderType, string> = {
      wof: 'WOF Due',
      registration: 'Registration Due',
      insurance: 'Insurance Renewal',
      service: 'Service Due',
      custom: '',
    }
    const base = titles[type]
    return vehicleName ? `${base} - ${vehicleName}` : base
  }

  const selectedVehicleName = vehicles.find(v => v.id === selectedVehicle)?.name

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reminders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Reminder</h1>
          <p className="text-muted-foreground">Set up a new reminder for your vehicle</p>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Reminder Details</CardTitle>
              <CardDescription>Enter the reminder information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">You need to add a vehicle first</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/vehicles/new">Add Vehicle</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} {vehicle.registration_plate && `(${vehicle.registration_plate})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Reminder Type *</Label>
                  <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ReminderType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g., WOF Due - Family Car"
                    defaultValue={getDefaultTitle(selectedType, selectedVehicleName)}
                    key={`${selectedType}-${selectedVehicleName}`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="date"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notification_days">Notify Days Before</Label>
                    <Input
                      id="notification_days"
                      name="notification_days"
                      type="number"
                      min="1"
                      max="365"
                      defaultValue="14"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/dashboard/reminders">Cancel</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Reminder'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
