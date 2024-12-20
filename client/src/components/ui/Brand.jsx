import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Brand = ({ className }) => {
  return (
    <div className={cn('text-3xl cursor-pointer font-bold text-center', className)}>
      <Link to="/">Aditya&apos;s Blog</Link>
    </div>
  );
};

export default Brand;
