import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaveDetail {
  days: number;
  type: string;
  isPersonal: boolean;
}

interface LeaveBalance {
  allowance: {
    total: number;
    used: number;
    remaining: number;
    pending: number;
    pendingDetails: LeaveDetail[];
  };
  personal: {
    total: number;
    used: number;
    remaining: number;
    pending: number;
    pendingDetails: LeaveDetail[];
  };
}

export function LeaveBalance({ 
  compact = false,
  pendingOnly = false 
}: { 
  compact?: boolean;
  pendingOnly?: boolean;
}) {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/user/leave-balance");
        if (!response.ok) {
          throw new Error("Failed to fetch leave balance");
        }
        const data = await response.json();
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load balance");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) {
    return compact ? (
      "..."
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return compact ? (
      "Error"
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  if (compact) {
    if (pendingOnly) {
      if (!balance) return null;
      const totalPending = balance.allowance.pending + balance.personal.pending;
      if (totalPending === 0) return null;
      
      const parts = [];
      if (balance.allowance.pending > 0) {
        parts.push(`${balance.allowance.pending} annual`);
      }
      if (balance.personal.pending > 0) {
        parts.push(`${balance.personal.pending} personal`);
      }
      return parts.join(", ");
    }
    return balance.allowance.total.toString() + " days";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Annual Leave</h3>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total</p>
                <p className="mt-1 text-2xl font-semibold">{balance.allowance.total}</p>
              </div>
              <div>
                <p className="text-gray-500">Used</p>
                <p className="mt-1 text-2xl font-semibold">{balance.allowance.used}</p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  {balance.allowance.remaining}
                </p>
              </div>
            </div>
            {balance.allowance.pending > 0 && (
              <div className="mt-2 border-t pt-2">
                <p className="text-sm text-amber-600">
                  Pending Approval: {balance.allowance.pending} days
                </p>
                <div className="mt-1 space-y-1">
                  {balance.allowance.pendingDetails.map((detail, i) => (
                    <p key={i} className="text-sm text-gray-500">
                      {detail.days} {detail.days === 1 ? "day" : "days"} {detail.type}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Personal Days</h3>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total</p>
                <p className="mt-1 text-2xl font-semibold">{balance.personal.total}</p>
              </div>
              <div>
                <p className="text-gray-500">Used</p>
                <p className="mt-1 text-2xl font-semibold">{balance.personal.used}</p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  {balance.personal.remaining}
                </p>
              </div>
            </div>
            {balance.personal.pending > 0 && (
              <div className="mt-2 border-t pt-2">
                <p className="text-sm text-amber-600">
                  Pending Approval: {balance.personal.pending} days
                </p>
                <div className="mt-1 space-y-1">
                  {balance.personal.pendingDetails.map((detail, i) => (
                    <p key={i} className="text-sm text-gray-500">
                      {detail.days} {detail.days === 1 ? "day" : "days"} {detail.type}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
