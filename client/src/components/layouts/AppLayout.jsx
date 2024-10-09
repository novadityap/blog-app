import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/layouts/AppHeader.jsx';
import Footer from '@/components/layouts/Footer.jsx';
import AppSidebar from '@/components/layouts/AppSidebar.jsx';
import { useState, useRef, useEffect } from 'react';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleClickOutside = (e) => {
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
    <div className="flex">
      <AppSidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen} />
      <div className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
        <AppHeader onToggleSidebar={handleSidebar} />
        <main className="container mx-auto px-5 lg:px-10 xl:px-20 flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
