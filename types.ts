
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  STAFF = 'STAFF'
}

export interface Package {
  id: string;
  name: string;
  price: number;
  studentLimit: number;
  features: string[];
}

export interface Institution {
  id: string;
  name: string;
  country: string;
  address: string;
  nic: string;
  contact: string;
  email: string;
  status: 'pending' | 'active' | 'suspended';
  agreementAcceptedAt: string | null;
  institutionCode: string;
  packageId?: string;
  verified: boolean;
}

export interface Student {
  id: string; // The generated ID LK-ABC-2026-7391
  name: string;
  grade: string;
  whatsapp: string;
  parentName: string;
  institutionId: string;
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  time: string;
  staffId: string;
  institutionId: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  institutionId: string;
  amount: number;
  month: string;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

export interface AppState {
  user: {
    role: UserRole;
    institutionId?: string;
    name: string;
    email?: string;
  } | null;
  institutions: Institution[];
  students: Student[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  packages: Package[];
}
