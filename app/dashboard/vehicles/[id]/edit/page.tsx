'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Car, Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Vehicle } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditVehiclePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loadingVehicle, setLoadingVehicle] = useState(true)

  useEffect(() => {
    async function loadVehicle() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!data) {
        router.push('/dashboard/vehicles')
        return
      }

      setVehicle(data)
      setLoadingVehicle(false)
    }

    loadVehicle()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const vehicleData = {
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
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('vehicles')
      .update(vehicleData)
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    router.push(`/dashboard/vehicles/${id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      setIsDeleting(false)
      return
    }

    router.push('/dashboard/vehicles')
    router.refresh()
  }

  if (loadingVehicle) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!vehicle) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/vehicles/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Vehicle</h1>
          <p className="text-muted-foreground">Update vehicle information</p>
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
              <CardDescription>Update your vehicle information</CardDescription>
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
                  defaultValue={vehicle.name}
                />
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
                    defaultValue={vehicle.year || ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" placeholder="Toyota" defaultValue={vehicle.make || ''} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" placeholder="Corolla" defaultValue={vehicle.model || ''} />
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
                    defaultValue={vehicle.registration_plate || ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" placeholder="Silver" defaultValue={vehicle.color || ''} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input id="vin" name="vin" placeholder="1HGBH41JXMN109186" defaultValue={vehicle.vin || ''} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input id="purchase_date" name="purchase_date" type="date" defaultValue={vehicle.purchase_date || ''} />
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
                    defaultValue={vehicle.purchase_price || ''}
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
                  defaultValue={vehicle.current_odometer}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/dashboard/vehicles/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete this vehicle and all associated data.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Vehicle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the vehicle
                    and all associated reminders and expenses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
