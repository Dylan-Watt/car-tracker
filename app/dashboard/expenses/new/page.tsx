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
import { ArrowLeft, DollarSign, Loader2 } from 'lucide-react'
import type { Vehicle, ExpenseType } from '@/lib/types'

const expenseTypes: { value: ExpenseType; label: string }[] = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'repair', label: 'Repair' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'registration', label: 'Registration' },
  { value: 'wof', label: 'WOF' },
  { value: 'other', label: 'Other' },
]

export default function NewExpensePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedVehicle = searchParams.get('vehicle')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle || '')
  const [selectedType, setSelectedType] = useState<ExpenseType>('fuel')

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

    const expenseData = {
      user_id: user.id,
      vehicle_id: selectedVehicle,
      type: selectedType,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      odometer: formData.get('odometer') ? parseInt(formData.get('odometer') as string) : null,
      description: formData.get('description') as string || null,
      vendor: formData.get('vendor') as string || null,
      fuel_quantity: formData.get('fuel_quantity') ? parseFloat(formData.get('fuel_quantity') as string) : null,
      fuel_price_per_unit: formData.get('fuel_price_per_unit') ? parseFloat(formData.get('fuel_price_per_unit') as string) : null,
    }

    const { error: insertError } = await supabase.from('expenses').insert(expenseData)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    // Update vehicle odometer if provided
    if (expenseData.odometer) {
      await supabase
        .from('vehicles')
        .update({ current_odometer: expenseData.odometer, updated_at: new Date().toISOString() })
        .eq('id', selectedVehicle)
    }

    router.push('/dashboard/expenses')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-muted-foreground">Record a new expense for your vehicle</p>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Enter the expense information</CardDescription>
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="type">Expense Type *</Label>
                    <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ExpenseType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {selectedType === 'fuel' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="fuel_quantity">Fuel Quantity (L)</Label>
                      <Input
                        id="fuel_quantity"
                        name="fuel_quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="40.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fuel_price_per_unit">Price per Litre ($)</Label>
                      <Input
                        id="fuel_price_per_unit"
                        name="fuel_price_per_unit"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="2.50"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="odometer">Odometer (km)</Label>
                    <Input
                      id="odometer"
                      name="odometer"
                      type="number"
                      min="0"
                      placeholder="Current reading"
                    />
                    <p className="text-xs text-muted-foreground">Updates vehicle odometer</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vendor">Vendor / Location</Label>
                    <Input
                      id="vendor"
                      name="vendor"
                      placeholder="e.g., Z Energy, Repco"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Any additional details..."
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/dashboard/expenses">Cancel</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Expense'
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
