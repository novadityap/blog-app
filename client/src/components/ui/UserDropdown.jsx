import { Link } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn-ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import {
  TbHome,
  TbApps,
  TbLogout,
  TbEdit,
  TbLogin,
} from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import useSignout from '@/hooks/useSignout';

const UserDropdown = ({ className }) => {
  const { token, currentUser } = useSelector(state => state.auth);
  const { handleSignout } = useSignout();

  const menuItems = [
    { name: 'Home', icon: TbHome, link: '/' },
    ...(token
      ? [
          { name: 'Dashboard', icon: TbApps, link: '/dashboard' },
          { name: 'Sign Out', icon: TbLogout, action: handleSignout },
        ]
      : [
          { name: 'Sign Up', icon: TbEdit, link: '/signup' },
          { name: 'Sign In', icon: TbLogin, link: '/signin' },
        ]),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn('outline-none', className)}>
        <Avatar>
          <AvatarImage src={currentUser.avatar} alt="User Avatar" />
          <AvatarFallback>
            {currentUser.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4 w-40">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map(({ name, icon: Icon, link, action }, index) =>
          link ? (
            <Link key={index} to={link}>
              <DropdownMenuItem className="cursor-pointer hover:focus:bg-gray-200">
                <Icon className="mr-2 size-5" />
                {name}
              </DropdownMenuItem>
            </Link>
          ) : (
            <DropdownMenuItem
              key={index}
              onClick={action}
              className="cursor-pointer hover:focus:bg-gray-200"
            >
              <Icon className="mr-2 size-5" />
              {name}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
