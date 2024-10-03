import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader.jsx';
import Footer from './Footer.jsx';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AppHeader />
      <main className="container mx-auto px-5 lg:px-10 xl:px-20 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
