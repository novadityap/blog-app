import { Outlet } from 'react-router-dom';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/shadcn-ui/button';
import UserDropdown from '@/components/ui/UserDropdown';
import { Input } from '@/components/shadcn-ui/input';
import { setSearchTerm } from '@/features/querySlice';
import { TbSearch, TbX, TbMenu2 } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { useLocation } from 'react-router-dom';
import { useLazyListCategoriesQuery } from '@/services/categoryApi';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '@/features/querySlice';
import { Separator } from '@/components/shadcn-ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/shadcn-ui/collapsible';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn-ui/avatar';
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
import Brand from '@/components/ui/Brand';
import useSignout from '@/hooks/useSignout';
import SidebarMenu from '@/components/ui/SidebarMenu';

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { token } = useSelector(state => state.auth);

  return (
    <header className="py-6  flex items-center bg-white shadow-md">
      <div className="container mx-auto px-5 lg:px-10 xl:px-20">
        <nav className="flex items-center justify-between">
          <div className="w-full flex items-center justify-between mr-4 md:justify-start">
            <TbMenu2
              className="size-5 cursor-pointer md:hidden"
              onClick={onToggleSidebar}
            />

            <Input
              type="text"
              placeholder="Search"
              className={cn(
                'hidden md:block md:w-80 lg:w-96',
                isSearchOpen && 'block w-72'
              )}
              name="search"
              onChange={e => dispatch(setSearchTerm(e.target.value))}
            />

            {!isSearchOpen && (
              <TbSearch
                className="size-5 cursor-pointer md:hidden"
                onClick={() => setIsSearchOpen(true)}
              />
            )}

            {isSearchOpen && (
              <TbX
                className="size-5 cursor-pointer md:hidden"
                onClick={() => setIsSearchOpen(false)}
              />
            )}
          </div>

          <div className="hidden md:flex md:items-center md:gap-x-3">
            {token ? (
              <UserDropdown className="md:order-2" />
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="ghost">Sign Up</Button>
                </Link>
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
              </>
            )}
            <Link to="/" className="md:order-1">
              <Button variant="primary">Home</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="border-t-2 py-6 flex items-center justify-center bg-gray-100 ">
    <p className="text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Adit&apos;s Blog. All rights reserved.
    </p>
  </footer>
);

const UserProfile = ({ currentUser }) => (
  <div className="flex items-center gap-x-2 p-4">
    <Avatar className="size-14">
      <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
      <AvatarFallback>
        {currentUser.username?.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col text-gray-200">
      <span className="capitalize font-semibold">{currentUser.username}</span>
      <span>{currentUser.email}</span>
    </div>
  </div>
);

const Categories = ({
  isOpenCategories,
  handleCategories,
  categories,
  dispatch,
}) => (
  <Collapsible
    open={isOpenCategories}
    onOpenChange={handleCategories}
    className="text-gray-200"
  >
    <CollapsibleTrigger asChild>
      <div className="space-y-1 ">
        <div className="flex items-center gap-x-3 px-4 py-3 rounded-xl hover:bg-gray-200 hover:text-gray-800">
          <TbFolders className="size-5" />
          <span>Categories</span>
          <TbChevronDown
            className={cn(
              'absolute top-30 right-10 size-5',
              isOpenCategories && 'rotate-180'
            )}
          />
        </div>
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <ScrollArea className="h-60">
        <ul className="mx-4">
          {categories?.data?.map(({ _id, name }) => (
            <li
              key={_id}
              className="ps-6 py-3 rounded-xl hover:bg-gray-200 hover:text-gray-800"
              onClick={() => dispatch(setFilters({ category: _id }))}
            >
              {name}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </CollapsibleContent>
  </Collapsible>
);

const Sidebar = forwardRef(({ isSidebarOpen }, ref) => {
  const dispatch = useDispatch();
  const { token, currentUser } = useSelector(state => state.auth);
  const { pathname } = useLocation();
  const { handleSignout } = useSignout();
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [getCategories, { data: categories }] = useLazyListCategoriesQuery();

  const handleCategories = open => {
    setIsOpenCategories(open);
    if (open) getCategories();
  };

  const menuItems = [
    { name: 'Home', icon: TbHome, link: '/' },
    ...(pathname === '/'
      ? [
          {
            name: 'categories',
            icon: TbFolders,
            component: (
              <Categories
                isOpenCategories={isOpenCategories}
                handleCategories={handleCategories}
                categories={categories}
                dispatch={dispatch}
              />
            ),
          },
        ]
      : []),
    ...(currentUser?.role === 'admin'
      ? [{ name: 'Dashboard', icon: TbApps, link: '/dashboard' }]
      : []),
    ...(token
      ? [
          { name: 'Profile', icon: TbUser, link: '/profile' },
          { name: 'Sign Out', icon: TbLogout, action: handleSignout },
        ]
      : []),
    ...(!token
      ? [
          { name: 'Sign Up', icon: TbEdit, link: '/signup' },
          { name: 'Sign In', icon: TbLogin, link: '/signin' },
        ]
      : []),
  ];

  return (
    <aside
      ref={ref}
      className={cn(
        'w-64 fixed md:hidden z-50 h-screen left-0 top-0 overflow-y-hidden flex flex-col bg-gradient-to-b from-green-500 via-green-600 to-green-700 transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {token ? (
        <UserProfile currentUser={currentUser} />
      ) : (
        <Brand className="p-4 text-gray-200" />
      )}

      <Separator />

      <div className="px-4 mt-4 cursor-pointer">
        <SidebarMenu menuItems={menuItems} />
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleClickOutside = e => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col min-h-screen gap-y-10">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-grow">
        <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen} />
        <main className="container mx-auto px-5 lg:px-10 xl:px-20 flex-grow flex items-center justify-center">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
