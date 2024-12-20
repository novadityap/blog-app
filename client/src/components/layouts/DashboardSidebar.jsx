import {
  TbApps,
  TbUsersGroup,
  TbNews,
  TbMessage,
  TbFolders,
  TbUserCog,
  TbShieldCog,
} from 'react-icons/tb';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { forwardRef } from 'react';
import Brand from '@/components/ui/Brand';

const DashboardSidebar = forwardRef(({ isOpen }, ref) => {
  const { pathname } = useLocation();
  const menuItems = [
    { name: 'Dashboard', icon: TbApps, link: '/dashboard' },
    { name: 'Users', icon: TbUsersGroup, link: '/dashboard/users' },
    { name: 'Posts', icon: TbNews, link: '/dashboard/posts' },
    { name: 'Comments', icon: TbMessage, link: '/dashboard/comments' },
    { name: 'Categories', icon: TbFolders, link: '/dashboard/categories' },
    { name: 'Roles', icon: TbUserCog, link: '/dashboard/roles' },
    { name: 'Permissions', icon: TbShieldCog, link: '/dashboard/permissions' },
  ];

  return (
    <aside
      ref={ref}
      className={cn(
        'w-64 fixed lg:static inset-y-0 z-30 bg-gray-900 text-gray-200 flex flex-col transition duration-500 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <Brand className="border-b border-gray-700 p-4" />
      <ScrollArea>
          <ul className="space-y-2 px-4 mt-5">
            {menuItems.map(({ name, icon: Icon, link }, index) => (
            
              <li key={index}>
                <Link
                  to={link}
                  className={cn(
                    'flex items-center p-4 rounded-md font-semibold hover:bg-gray-700 hover:text-white',
                    pathname === link && 'bg-gray-700 text-white'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
      </ScrollArea>
    </aside>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
