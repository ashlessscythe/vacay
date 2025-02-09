"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CompanySettingsProps {
  initialSettings: {
    is_team_view_hidden: boolean
  }
}

export function CompanySettings({ initialSettings }: CompanySettingsProps) {
  const [isTeamViewHidden, setIsTeamViewHidden] = useState(initialSettings.is_team_view_hidden)

  const handleToggleTeamView = async (checked: boolean) => {
    try {
      const response = await fetch("/api/companies/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_team_view_hidden: checked,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      setIsTeamViewHidden(checked)
    } catch (error) {
      console.error("Error updating company settings:", error)
      // Reset toggle if update fails
      setIsTeamViewHidden(!checked)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="team-view-toggle">Hide Team View for Non-Privileged Users</Label>
          <Switch
            id="team-view-toggle"
            checked={isTeamViewHidden}
            onCheckedChange={handleToggleTeamView}
          />
        </div>
      </CardContent>
    </Card>
  )
}
