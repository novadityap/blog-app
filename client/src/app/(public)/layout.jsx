'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link'
import { Button } from '@/components/shadcn/button';
import UserDropdown from '@/components/ui/UserDropdown';
import { Input } from '@/components/shadcn/input';
import { setSearchTerm } from '@/lib/features/querySlice';
import { TbSearch, TbX, TbMenu2 } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { Separator } from '@/components/shadcn/separator';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/avatar';
import { TbLogin, TbLogout, TbEdit, TbApps, TbHome } from 'react-icons/tb';
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
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    className="font-semibold text-gray-800"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
            <Link href="/">
              <Button variant="ghost" className="md:order-1 font-semibold text-gray-800">
                Home
              </Button>
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
      <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
      <AvatarFallback>
        {currentUser?.username.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col text-gray-200">
      <span className="capitalize font-semibold">{currentUser?.username}</span>
      <span>{currentUser?.email}</span>
    </div>
  </div>
);

const Sidebar = ({ isSidebarOpen, ref }) => {
  const { token, currentUser } = useSelector(state => state.auth);
  const { handleSignout } = useSignout();

  const menuItems = [
    { name: 'Home', icon: TbHome, link: '/' },
    ...(token
      ? [
          { name: 'Dashboard', icon: TbApps, link: currentUser?.role === 'admin' ? '/dashboard' : '/dashboard/profile' },
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
        'w-64 fixed md:hidden z-50 h-screen left-0 top-0 overflow-y-hidden flex flex-col text-gray-200 bg-gray-900 transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {token ? (
        <UserProfile currentUser={currentUser} />
      ) : (
        <Brand className="border-b border-gray-700 p-4" />
      )}

      <Separator />

      <div className="px-4 mt-4 cursor-pointer">
        <SidebarMenu menuItems={menuItems} />
      </div>
    </aside>
  );
};

const AppLayout = ({ children }) => {
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
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
