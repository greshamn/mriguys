import React from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { ChevronDown, User, Shield, Users, Building2, Scale, DollarSign, Settings } from 'lucide-react';
import { useRole } from '../context/RoleContext';

// Role icons mapping
const roleIcons = {
  admin: Shield,
  patient: User,
  referrer: Users,
  'imaging-center': Building2,
  attorney: Scale,
  funder: DollarSign,
  ops: Settings
};

// Role display names
const roleDisplayNames = {
  admin: 'Admin',
  patient: 'Patient',
  referrer: 'Referrer',
  'imaging-center': 'Imaging Center',
  attorney: 'Attorney',
  funder: 'Funder',
  ops: 'Operations'
};

export const RoleSwitcher = () => {
  const { viewingAsRole, availableRoles, switchViewingRole, isAdmin } = useRole();

  // Only show for admin users
  if (!isAdmin) {
    return null;
  }

  const currentRoleIcon = roleIcons[viewingAsRole] || Shield;
  const CurrentIcon = currentRoleIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Viewing as: {roleDisplayNames[viewingAsRole]}</span>
          <span className="sm:hidden">{roleDisplayNames[viewingAsRole]}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Viewing Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableRoles.map((role) => {
          const Icon = roleIcons[role];
          const isActive = role === viewingAsRole;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => switchViewingRole(role)}
              className={`flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{roleDisplayNames[role]}</span>
              {isActive && (
                <span className="ml-auto text-xs text-muted-foreground">Current</span>
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Your admin permissions remain active
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
