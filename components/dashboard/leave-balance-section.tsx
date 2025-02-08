import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LeaveBalance } from "@/components/dashboard/leave-balance"

interface LeaveBalanceSectionProps {
  onRequestLeave: () => void
}

export function LeaveBalanceSection({ onRequestLeave }: LeaveBalanceSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <LeaveBalance />
        <Button 
          onClick={onRequestLeave}
          className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>
    </div>
  )
}
