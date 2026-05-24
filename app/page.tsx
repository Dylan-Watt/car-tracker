import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Car, 
  Bell, 
  DollarSign, 
  Calendar, 
  Shield, 
  Fuel, 
  Wrench, 
  FileText,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 text-primary">
            <Car className="h-7 w-7" />
            <span className="text-xl font-bold">VehicleTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Keep Your Vehicles Running Smoothly
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
            Track servicing, WOF, registration, insurance, and all maintenance costs in one place. 
            Never miss a due date with smart reminders.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Tracking Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign in to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to manage your vehicles</h2>
            <p className="mt-4 text-muted-foreground">
              From daily fuel tracking to annual WOF reminders, VehicleTrack has you covered.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-4">Smart Reminders</CardTitle>
                <CardDescription>
                  Get notified before WOF, registration, insurance, and service due dates.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Fuel className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-4">Fuel Tracking</CardTitle>
                <CardDescription>
                  Log fuel purchases and monitor your consumption over time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-4">Maintenance Log</CardTitle>
                <CardDescription>
                  Keep a complete history of all repairs and maintenance work.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-4">Cost Analysis</CardTitle>
                <CardDescription>
                  Understand your total cost of ownership with detailed expense breakdowns.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-4">WOF & Rego</CardTitle>
                <CardDescription>
                  Track Warrant of Fitness and registration expiry dates for all vehicles.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-4">Service History</CardTitle>
                <CardDescription>
                  Complete documentation of your vehicle&apos;s service history in one place.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Never miss an important date again
                </h2>
                <p className="mt-4 text-muted-foreground">
                  VehicleTrack sends you reminders before your WOF expires, registration is due, 
                  or when it&apos;s time for scheduled maintenance.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    'Customizable reminder notifications',
                    'Track multiple vehicles',
                    'Complete expense history',
                    'Fuel efficiency monitoring',
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-sm">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">WOF Due</p>
                        <p className="text-sm text-muted-foreground">In 14 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-sm">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Registration</p>
                        <p className="text-sm text-muted-foreground">In 45 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-sm">
                      <Wrench className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Service Due</p>
                        <p className="text-sm text-muted-foreground">At 95,000 km</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to get organized?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join thousands of vehicle owners who trust VehicleTrack to keep their vehicles 
            maintained and road-legal.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/auth/sign-up">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="h-5 w-5" />
            <span className="font-medium">VehicleTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made for New Zealand vehicle owners
          </p>
        </div>
      </footer>
    </div>
  )
}
