export interface Vehicle {
  id: string
  user_id: string
  name: string
  make: string | null
  model: string | null
  year: number | null
  registration_plate: string | null
  vin: string | null
  color: string | null
  purchase_date: string | null
  purchase_price: number | null
  current_odometer: number
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  vehicle_id: string
  user_id: string
  type: 'wof' | 'registration' | 'insurance' | 'service' | 'custom'
  title: string
  due_date: string
  notes: string | null
  is_completed: boolean
  notification_days: number
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  vehicle_id: string
  user_id: string
  type: 'fuel' | 'repair' | 'maintenance' | 'insurance' | 'registration' | 'wof' | 'other'
  amount: number
  date: string
  odometer: number | null
  description: string | null
  vendor: string | null
  fuel_quantity: number | null
  fuel_price_per_unit: number | null
  created_at: string
  updated_at: string
}

export type ReminderType = Reminder['type']
export type ExpenseType = Expense['type']
