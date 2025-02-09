export type BankHoliday = {
  id: number;
  name: string;
  date: string;
  company_id: number;
  created_at: Date;
  updated_at: Date;
}

export type CreateBankHolidayInput = Omit<BankHoliday, 'id' | 'company_id' | 'created_at' | 'updated_at'>;
