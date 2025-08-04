'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const Brand = ({ className }) => {
  return (
    <div
      className={cn('text-3xl cursor-pointer font-bold text-center', className)}
    >
      <Link href="/">Adit&apos;s Blog</Link>
    </div>
  );
};

export default Brand;
