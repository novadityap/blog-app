import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import UserDropdown from '@/components/ui/UserDropdown';

const AppHeader = () => {
  const { token } = useSelector(state => state.auth);

  return (
    <header className="py-4 mb-4 bg-white shadow-md">
      <div className="container mx-auto px-5 lg:px-10 xl:px-20">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-green-500">
            Aditya&apos;s Blog
          </Link>
          <div className="flex items-center gap-x-4">
            <Link to="/signup">
              <Button variant="outline" className="hover:bg-gray-200">
                Sign Up
              </Button>
            </Link>
            {token ? (
              <UserDropdown/>
            ) : (
              <Link to="/signin">
                <Button variant="primary" className="ml-2 ">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
