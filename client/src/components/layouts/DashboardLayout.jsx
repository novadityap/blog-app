import DashboardSidebar from '@/components/layouts/DashboardSidebar.jsx';
import DashboardHeader from '@/components/layouts/DashboardHeader.jsx'
import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const handleSidebar = () =>{
    setIsSidebarOpen(!isSidebarOpen);
  }

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
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar isOpen={isSidebarOpen} ref={sidebarRef}/>
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        <DashboardHeader toggleSidebar={handleSidebar} />
        <main className="container mx-auto p-5 lg:px-10 xl:px-20 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
