import { UserRole } from './user.model';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  section?: string;
  children?: NavItem[];
}
