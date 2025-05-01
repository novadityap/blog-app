import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SidebarMenu = ({ menuItems }) => (
  <ul className="space-y-1 px-4 mt-4 text-gray-200">
    {menuItems.map(({ name, icon: Icon, link, component, action }, index) => (
      <li key={index}>
        {link ? (
          <NavLink
            to={link}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-x-3 p-3 rounded-xl hover:bg-gray-200 hover:text-gray-800',
                isActive && 'bg-gray-200 text-gray-800'
              )
            }
          >
            <Icon className="size-5" />
            {name}
          </NavLink>
        ) : component ? (
          component
        ) : (
          <button
            onClick={action}
            className="flex items-center gap-x-3 p-3 w-full text-left rounded-xl hover:bg-gray-200 hover:text-gray-800"
          >
            <Icon className="size-5" />
            {name}
          </button>
        )}
      </li>
    ))}
  </ul>
);

export default SidebarMenu;
