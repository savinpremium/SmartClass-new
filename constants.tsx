
import React from 'react';
import { LayoutDashboard, Users, UserCheck, CreditCard, Building2, ShieldCheck, LogOut, Search, ScanLine, PlusCircle } from 'lucide-react';
import { UserRole } from './types';

export const MOCK_INSTITUTIONS = [
  {
    id: 'inst-1',
    name: 'Global Academy UK',
    country: 'United Kingdom',
    address: '10 Downing St, London',
    nic: 'NIC123456789',
    contact: '+44 7700 900077',
    email: 'admin@globalacademy.uk',
    status: 'active',
    agreementAcceptedAt: '2024-01-15T10:30:00Z',
    institutionCode: 'UK-GA'
  },
  {
    id: 'inst-2',
    name: 'Tokyo Tech Junior',
    country: 'Japan',
    address: 'Shinjuku City, Tokyo',
    nic: 'JPN-987654321',
    contact: '+81 90-1234-5678',
    email: 'info@tokyotech.jp',
    status: 'active',
    agreementAcceptedAt: '2024-02-10T09:00:00Z',
    institutionCode: 'JP-TT'
  }
];

export const MOCK_STUDENTS = [
  {
    id: 'UK-GA-2024-1102',
    name: 'Alice Johnson',
    grade: 'Year 10',
    whatsapp: '+44 7700 900111',
    parentName: 'Mark Johnson',
    institutionId: 'inst-1',
    registeredAt: '2024-01-20'
  },
  {
    id: 'JP-TT-2024-5542',
    name: 'Hiroshi Tanaka',
    grade: 'Grade 8',
    whatsapp: '+81 90-9988-7766',
    parentName: 'Yumi Tanaka',
    institutionId: 'inst-2',
    registeredAt: '2024-02-15'
  }
];

export const NAV_ITEMS = {
  [UserRole.SUPER_ADMIN]: [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
    { label: 'Institutions', icon: <Building2 size={20} />, id: 'institutions' },
    { label: 'Global Reports', icon: <ShieldCheck size={20} />, id: 'reports' }
  ],
  [UserRole.INSTITUTION_ADMIN]: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
    { label: 'Students', icon: <Users size={20} />, id: 'students' },
    { label: 'Attendance', icon: <UserCheck size={20} />, id: 'attendance' },
    { label: 'Payments', icon: <CreditCard size={20} />, id: 'payments' },
    { label: 'Staff', icon: <ShieldCheck size={20} />, id: 'staff' }
  ],
  [UserRole.STAFF]: [
    { label: 'Quick Scan', icon: <ScanLine size={20} />, id: 'attendance' },
    { label: 'Student Info', icon: <Users size={20} />, id: 'students' }
  ]
};
