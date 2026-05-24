import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Car, Plus, Settings } from 'lucide-react'
import type { Vehicle } from '@/lib/types'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let vehicles: Vehicle[] = []
  if (user) {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    vehicles = data || []
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage your registered vehicles
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Car className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No vehicles yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Add your first vehicle to start tracking expenses and reminders.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/vehicles/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Vehicle
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="group relative overflow-hidden">
              <Link href={`/dashboard/vehicles/${vehicle.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View {vehicle.name}</span>
              </Link>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                      {vehicle.registration_plate && (
                        <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          {vehicle.registration_plate}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-20 opacity-0 transition-opacity group-hover:opacity-100"
                    asChild
                  >
                    <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-1">
                  {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'No details added'}
                </CardDescription>
                {vehicle.current_odometer > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {vehicle.current_odometer.toLocaleString()} km
                  </p>
                )}
                {vehicle.color && (
                  <div className="mt-2 flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full border"
                      style={{ backgroundColor: vehicle.color.toLowerCase() }}
                    />
                    <span className="text-sm text-muted-foreground capitalize">{vehicle.color}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
