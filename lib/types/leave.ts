import { User } from "./user";
import { z } from "zod";
import { parseISO, isBefore } from "date-fns";

export interface LeaveType {
  id: number;
  name: string;
  color: string;
  use_allowance: boolean;
  use_personal: boolean;
  limit?: number;
  auto_approve?: boolean;
}

// Validation schema
export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  dateStart: z.string().min(1, "Start date is required"),
  dateEnd: z.string().min(1, "End date is required"),
  dayPartStart: z.string().min(1, "Start day part is required"),
  dayPartEnd: z.string().min(1, "End day part is required"),
  employeeComment: z.string().optional(),
}).refine((data) => {
  const start = parseISO(data.dateStart);
  const end = parseISO(data.dateEnd);
  return !isBefore(end, start);
}, {
  message: "End date cannot be before start date",
  path: ["dateEnd"],
});

export type LeaveRequestValues = z.infer<typeof leaveRequestSchema>;

export interface Leave {
  id: number;
  date_start: string;
  date_end: string;
  day_part_start: number;
  day_part_end: number;
  status: number;
  employee_comment?: string | null;
  users_leaves_user_idTousers?: User;
  leave_types: LeaveType;
}

export interface LeaveApprovalProps {
  leaveId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}

export interface RecentLeavesProps {
  loading: boolean;
  leaves: Leave[];
}

export interface LeaveApprovalListProps {
  leaves: Leave[];
}

export interface LeaveRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}

export const getStatusDetails = (status: number): { text: string; classes: string } => {
  switch (status) {
    case 2:
      return {
        text: "Approved",
        classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      };
    case 3:
      return {
        text: "Rejected",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      };
    default:
      return {
        text: "Pending",
        classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      };
  }
};
