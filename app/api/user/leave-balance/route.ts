import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import { prisma } from "@/lib/prisma";

interface LeaveCount {
  allowance: number;
  personal: number;
}

function calculateDays(
  startDate: Date,
  endDate: Date,
  startPart: number,
  endPart: number
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (daysDiff === 1) {
    if (startPart === 2 || endPart === 3) {
      return 0.5;
    }
    return 1;
  }

  let totalDays = daysDiff;

  // Adjust for partial first day
  if (startPart === 2) {
    totalDays -= 0.5;
  }

  // Adjust for partial last day
  if (endPart === 3) {
    totalDays -= 0.5;
  }

  return totalDays;
}

interface Leave {
  date_start: Date
  date_end: Date
  day_part_start: number
  day_part_end: number
  leave_types: {
    use_allowance: boolean
    use_personal: boolean
  }
}

function countLeaveDays(leaves: Leave[]): LeaveCount {
  return leaves.reduce(
    (acc, leave) => {
      const days = calculateDays(
        leave.date_start,
        leave.date_end,
        leave.day_part_start,
        leave.day_part_end
      );
      if (leave.leave_types.use_allowance) {
        acc.allowance += days;
      }
      if (leave.leave_types.use_personal) {
        acc.personal += days;
      }
      return acc;
    },
    { allowance: 0, personal: 0 }
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with department and all adjustments
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
      include: {
        departments: true,
        user_allowance_adjustment: {
          orderBy: {
            year: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get current year for calculations
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
    
    // Get current year adjustment or create default
    const currentYearAdjustment = user.user_allowance_adjustment.find(
      adj => adj.year === currentYear
    );

    // Get all leaves for current year
    const [approvedLeaves, pendingLeaves] = await Promise.all([
      // Approved leaves
      prisma.leaves.findMany({
        where: {
          user_id: user.id,
          status: 1, // Approved
          date_start: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        include: {
          leave_types: true
        }
      }),
      // Pending leaves
      prisma.leaves.findMany({
        where: {
          user_id: user.id,
          status: 0, // Pending
          date_start: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        include: {
          leave_types: true
        }
      })
    ]);

    // Calculate used and pending days
    const usedDays = countLeaveDays(approvedLeaves);
    const pendingDays = countLeaveDays(pendingLeaves);

    // Calculate total adjustments including previous years' carried over
    const totalAdjustment = {
      adjustment: currentYearAdjustment?.adjustment || 0,
      personal_adjustment: currentYearAdjustment?.personal_adjustment || 0,
      carried_over_allowance: user.user_allowance_adjustment.reduce((total, adj) => {
        // Only include carried over from previous years
        if (adj.year < currentYear) {
          return total + (adj.carried_over_allowance || 0);
        }
        return total;
      }, 0)
    };

    // Calculate total allowance including all adjustments
    const totalAllowance = user.departments.allowance + 
      totalAdjustment.adjustment + 
      totalAdjustment.carried_over_allowance;
    
    const totalPersonal = user.departments.personal +
      totalAdjustment.personal_adjustment;

    // Calculate remaining
    const remainingAllowance = totalAllowance - usedDays.allowance;
    const remainingPersonal = totalPersonal - usedDays.personal;

    // Group pending leaves by type for detailed view
    const pendingDetails = pendingLeaves.map(leave => ({
      days: calculateDays(leave.date_start, leave.date_end, leave.day_part_start, leave.day_part_end),
      type: leave.leave_types.name,
      isPersonal: leave.leave_types.use_personal
    }));

    return NextResponse.json({
      allowance: {
        total: totalAllowance,
        used: usedDays.allowance,
        remaining: remainingAllowance,
        pending: pendingDays.allowance,
        pendingDetails: pendingDetails.filter(d => !d.isPersonal)
      },
      personal: {
        total: totalPersonal,
        used: usedDays.personal,
        remaining: remainingPersonal,
        pending: pendingDays.personal,
        pendingDetails: pendingDetails.filter(d => d.isPersonal)
      }
    });

  } catch (error) {
    console.error("Error fetching leave balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
