'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Car, Loader2 } from 'lucide-react'

export default function NewVehiclePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to add a vehicle')
      setIsLoading(false)
      return
    }

    const vehicleData = {
      user_id: user.id,
      name: formData.get('name') as string,
      make: formData.get('make') as string || null,
      model: formData.get('model') as string || null,
      year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
      registration_plate: formData.get('registration_plate') as string || null,
      vin: formData.get('vin') as string || null,
      color: formData.get('color') as string || null,
      purchase_date: formData.get('purchase_date') as string || null,
      purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price') as string) : null,
      current_odometer: formData.get('current_odometer') ? parseInt(formData.get('current_odometer') as string) : 0,
    }

    const { error: insertError } = await supabase.from('vehicles').insert(vehicleData)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard/vehicles')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/vehicles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Vehicle</h1>
          <p className="text-muted-foreground">Register a new vehicle to track</p>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>Enter your vehicle information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Vehicle Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Family Car, Work Van"
                  required
                />
                <p className="text-xs text-muted-foreground">A friendly name to identify this vehicle</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" placeholder="Toyota" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" placeholder="Corolla" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="registration_plate">Registration Plate</Label>
                  <Input
                    id="registration_plate"
                    name="registration_plate"
                    placeholder="ABC123"
                    className="uppercase"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" placeholder="Silver" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input id="vin" name="vin" placeholder="1HGBH41JXMN109186" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input id="purchase_date" name="purchase_date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchase_price">Purchase Price ($)</Label>
                  <Input
                    id="purchase_price"
                    name="purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15000"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current_odometer">Current Odometer (km)</Label>
                <Input
                  id="current_odometer"
                  name="current_odometer"
                  type="number"
                  min="0"
                  placeholder="50000"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/dashboard/vehicles">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Vehicle'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
