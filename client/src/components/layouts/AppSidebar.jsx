import { forwardRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation } from 'react-router-dom';
import { useLazyGetCategoriesQuery } from '@/services/categoryApi';
import { cn } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { setFilters, clearFilters } from '@/features/uiSlice';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TbChevronDown,
  TbFolders,
  TbLogin,
  TbLogout,
  TbEdit,
  TbUser,
  TbApps,
  TbHome,
} from 'react-icons/tb';
import useAuth from '@/hooks/useAuth';
import Brand from '@/components/ui/Brand';

const AppSidebar = forwardRef(({ isSidebarOpen }, ref) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { handleSignout, token, currentUser, roles } = useAuth();
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [getCategories, { data: categories }] = useLazyGetCategoriesQuery();

  const menuItems = [
    token && { name: 'Profile', icon: TbUser, link: '/profile' },
    roles?.includes('admin') && {
      name: 'Dashboard',
      icon: TbApps,
      link: '/dashboard',
    },
    !token && { name: 'Sign Up', icon: TbEdit, link: '/signup' },
    !token && { name: 'Sign In', icon: TbLogin, link: '/signin' },
    token && { name: 'Sign Out', icon: TbLogout, link: null },
  ].filter(Boolean);

  const handleCategories = open => {
    setIsOpenCategories(open);
    if (open) getCategories();
  };

  return (
    <aside
      ref={ref}
      className={cn(
        'w-64 fixed md:hidden z-50 h-screen left-0 top-0 overflow-y-hidden flex flex-col bg-gradient-to-b from-green-500 via-green-600 to-green-700 transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {token ? (
        <div className="flex items-center gap-x-2 p-4">
          <Avatar className="size-14">
            <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
            <AvatarFallback>
              {currentUser.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-gray-200">
            <span className="capitalize font-semibold">
              {currentUser.username}
            </span>
            <span>{currentUser.email}</span>
          </div>
        </div>
      ) : (
        <Brand className="p-4 text-gray-200" />
      )}

      <Separator />

      <ScrollArea className="mt-5 cursor-pointer">
        <ul className="px-4 space-y-1 text-gray-200">
          <li>
            <Link
              to="/"
              className={cn(
                'flex items-center gap-x-3 px-4 py-3 rounded-md hover:bg-gray-200 hover:text-gray-800',
                pathname === '/' && 'bg-gray-200 text-gray-800'
              )}
              onClick={() => dispatch(clearFilters())}
            >
              <TbHome className="size-5" />
              Home
            </Link>
          </li>

          {pathname === '/' && (
            <Collapsible
              open={isOpenCategories}
              onOpenChange={handleCategories}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-200 hover:text-gray-800">
                  <div className="flex items-center gap-x-4">
                    <TbFolders className="size-5" />
                    <span>Categories</span>
                  </div>
                  <TbChevronDown
                    className={cn(
                      'absolute top-30 right-10 size-5',
                      isOpenCategories && 'rotate-180'
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="">
                {categories?.data?.map(({ _id, name }) => (
                  <li
                    key={_id}
                    className="ml-4 px-4 py-3 rounded-md hover:bg-gray-200 hover:text-gray-800"
                    onClick={() => dispatch(setFilters({ category: _id }))}
                  >
                    {name}
                  </li>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {menuItems.map(({ name, icon: Icon, link }, index) => (
            <li key={index}>
              {link ? (
                <Link 
                  to={link} 
                  className={cn('flex items-center gap-x-3 px-4 py-3 rounded-md hover:bg-gray-200 hover:text-gray-800', pathname === link && 'bg-gray-200 text-gray-800')}
                >
                  <Icon className="size-5" />
                  {name}
                </Link>
              ) : (
                <div
                  className={cn('flex items-center gap-x-3 px-4 py-3 rounded-md hover:bg-gray-200 hover:text-gray-800', pathname === link && 'bg-gray-200 text-gray-800')}
                  onClick={handleSignout}
                >
                  <Icon className="size-5" />
                  {name}
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
});

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
