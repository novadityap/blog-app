import UserDropdown from '@/components/ui/UserDropdown';
import { TbMenu2 } from 'react-icons/tb';

const DashboardHeader = ({toggleSidebar}) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between lg:justify-end items-center">
      <TbMenu2 className="size-5 cursor-pointer lg:hidden" onClick={toggleSidebar} />
      <UserDropdown />
    </header>
  );
};

export default DashboardHeader;
