'use client'

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Vehicle } from '@/lib/types'

interface HistoryFiltersProps {
  vehicles: Pick<Vehicle, 'id' | 'name'>[]
}

export function HistoryFilters({ vehicles }: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Vehicles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vehicles</SelectItem>
          {vehicles.map((vehicle) => (
            <SelectItem key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="expense">Expenses Only</SelectItem>
          <SelectItem value="reminder">Reminders Only</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="6months">Last 6 Months</SelectItem>
          <SelectItem value="3months">Last 3 Months</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
