"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankHoliday, CreateBankHolidayInput } from "@/types/bank-holiday";

export default function BankHolidayManager() {
  const [holidays, setHolidays] = useState<BankHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState<CreateBankHolidayInput>({ 
    name: "", 
    date: "" 
  });

  const fetchHolidays = async () => {
    const response = await fetch('/api/holidays');
    const data = await response.json();
    setHolidays(data);
    setLoading(false);
  };

  const addHoliday = async () => {
    const response = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHoliday),
    });
    if (response.ok) {
      fetchHolidays();
      setNewHoliday({ name: "", date: "" });
    }
  };

  const deleteHoliday = async (id: number) => {
    await fetch('/api/holidays', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchHolidays();
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Bank Holidays</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Holiday Name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="border p-2 mr-2"
                  required
                />
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="border p-2 mr-2"
                  required
                />
                <Button onClick={addHoliday}>Add Holiday</Button>
              </div>
              <ul>
                {holidays.map((holiday) => (
                  <li key={holiday.id} className="flex justify-between items-center">
                    <span>{holiday.name} - {new Date(holiday.date).toLocaleDateString()}</span>
                    <Button onClick={() => deleteHoliday(holiday.id)}>Delete</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
