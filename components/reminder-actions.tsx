'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, Trash2, RotateCcw } from 'lucide-react'
import type { Reminder } from '@/lib/types'

export function ReminderActions({ reminder }: { reminder: Reminder }) {
  const router = useRouter()

  const handleToggleComplete = async () => {
    const supabase = createClient()
    await supabase
      .from('reminders')
      .update({ is_completed: !reminder.is_completed, updated_at: new Date().toISOString() })
      .eq('id', reminder.id)
    router.refresh()
  }

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('reminders').delete().eq('id', reminder.id)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggleComplete}>
          {reminder.is_completed ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Mark as Active
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
