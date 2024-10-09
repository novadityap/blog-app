import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserDropdown from '@/components/ui/UserDropdown';
import { Input } from '@/components/ui/input';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from '@/features/uiSlice';
import { TbSearch, TbX, TbMenu2 } from 'react-icons/tb';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const AppHeader = ({ onToggleSidebar }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { token } = useAuth();
  const dispatch = useDispatch();

  const handleSearchChange = e => dispatch(setSearchTerm(e.target.value));

  return (
    <header className="h-16 flex items-center mb-4 bg-white shadow-md">
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
              onChange={handleSearchChange}
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
              <Button variant="primary">
                Home
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
