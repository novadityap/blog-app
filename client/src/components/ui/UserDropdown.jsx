import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TbUser, TbApps, TbLogout, TbEdit, TbLogin } from 'react-icons/tb';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const UserDropdown = ({className}) => {
  const { token, currentUser, roles, handleSignout } = useAuth();

  const hasAdminRole = roles?.includes('admin');

  const menuItems = [
    hasAdminRole && { name: 'Dashboard', icon: TbApps, link: '/dashboard' },
    !token && { name: 'Sign Up', icon: TbEdit, link: '/signup' },
    !token && { name: 'Sign In', icon: TbLogin, link: '/signin' },
    { name: 'Profile', icon: TbUser, link: '/profile' },
    token && { name: 'Sign Out', icon: TbLogout, link: null },
  ].filter(Boolean);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn('outline-none', className)}>
        <Avatar>
          <AvatarImage src={currentUser?.avatar} alt="User Avatar" />
          <AvatarFallback>
            {currentUser?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map(({ name, icon: Icon, link }, index) =>
          name === 'Sign Out' ? (
            <DropdownMenuItem key={index} onClick={handleSignout}>
              <Icon className="mr-3 size-5" />
              {name}
            </DropdownMenuItem>
          ) : (
            link && (
              <Link to={link} key={index}>
                <DropdownMenuItem>
                  <Icon className="mr-3 size-5" />
                  {name}
                </DropdownMenuItem>
              </Link>
            )
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
