'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/shadcn/breadcrumb';
import { TbHome } from 'react-icons/tb';

const BreadcrumbNav = () => {
  const pathname = usePathname();
  const pathnames = pathname.split('/').filter(x => x);

  return (
    <Breadcrumb>
      <BreadcrumbList className="mb-6">
        {pathnames.map((value, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem key={index}>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center">
                    {value === 'dashboard' && (
                      <TbHome className="size-5 mr-1" />
                    )}
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={routeTo} className="flex items-center gap-x-1">
                      {value === 'dashboard' && <TbHome className="size-5" />}
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
