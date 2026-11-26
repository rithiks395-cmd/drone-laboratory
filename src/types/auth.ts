export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  department: string;
  role: 'student' | 'admin';
  createdAt: string;
  lastActive: string;
  completedExpCount: number;
}
