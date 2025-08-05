'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const SidebarMenu = ({ menuItems }) => {
  const pathname = usePathname();

  return (
    <ul className="space-y-1 px-4 mt-4 text-gray-200">
      {menuItems.map(({ name, icon: Icon, link, component, action }, index) => {
        const isActive = pathname === link;

        return (
          <li key={index}>
            {link ? (
              <Link
                href={link}
                className={cn(
                  'flex items-center gap-x-3 p-3 rounded-xl hover:bg-gray-200 hover:text-gray-800',
                  isActive && 'bg-gray-200 text-gray-800'
                )}
              >
                <Icon className="size-5" />
                {name}
              </Link>
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
        );
      })}
    </ul>
  );
};

export default SidebarMenu;
