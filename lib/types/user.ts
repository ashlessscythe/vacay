export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  admin: boolean;
  manager: boolean;
  department_id: number;
  company_id: number;
  activated: boolean;
  start_date: Date;
  end_date?: Date;
  departments?: {
    id: number;
    name: string;
  };
}
