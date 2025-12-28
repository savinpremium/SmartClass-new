
import React from 'react';
import { LayoutDashboard, Users, UserCheck, CreditCard, Building2, ShieldCheck, ScanLine } from 'lucide-react';
import { UserRole } from './types';

export const MOCK_INSTITUTIONS = [];
export const MOCK_STUDENTS = [];

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
