import { useSearchPostsQuery } from '@/services/postApi';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Button } from '@/components/shadcn-ui/button';
import { useSelector } from 'react-redux';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn-ui/avatar';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn-ui/select';
import { useLazyListCategoriesQuery } from '@/services/categoryApi';
import dayjs from 'dayjs';
import { useState } from 'react';

const SkeletonLoader = ({ count }) => (
  <div className="flex flex-col items-center space-y-6 w-[400px] sm:w-[500px] md:w-[600px]">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="w-full shadow-lg hover:shadow-xl transition-shadow p-4 bg-white rounded-lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-x-4">
            <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-3 w-16 bg-gray-200" />
            </div>
          </div>
          <Skeleton className="h-6 w-full rounded bg-gray-200" />
        </div>
        <Skeleton className="h-56 w-full object-cover rounded-lg bg-gray-200 mt-4" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full rounded bg-gray-200" />
          <Skeleton className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
        <div className="flex justify-end mt-4">
          <Skeleton className="h-8 w-24 rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

const PostCard = ({ post }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="space-y-4">
      <CardTitle className="capitalize text-xl font-bold">
        <Link 
          to={`/posts/${post?.slug}`} 
          state={{ postId: post?._id }}
          className="hover:underline"
        >
          {post?.title}
        </Link>
      </CardTitle>
      <CardDescription className="flex items-center gap-x-4 text-sm text-gray-600">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post?.user?.avatar} alt={post?.user?.username} />
          <AvatarFallback>
            {post?.user?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{post?.user?.username}</span>
        <span className="text-gray-400">
          {dayjs(post?.createdAt).format('DD MMMM YYYY hh:mm A')}
        </span>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Link 
        to={`/posts/${post?.slug}`} 
        state={{ postId: post?._id }}
        className="block"
      >
        <img
          src={post?.postImage}
          alt={post?.title}
          className="w-full h-56 object-cover rounded-lg mb-4"
        />
      </Link>
      <div
        dangerouslySetInnerHTML={{ __html: post?.content }}
        className="line-clamp-2 text-gray-700 text-sm"
      />
    </CardContent>
    <CardFooter className="flex justify-end">
      <Button asChild variant="primary">
        <Link 
          to={`/posts/${post?.slug}`}
          state={{ postId: post?._id }}
        >
          Read More
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

const Sidebar = ({ categories, onOpen, onChange }) => (
  <aside className="space-y-8 lg:sticky lg:top-10  self-start">
    <div>
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <Select onOpenChange={onOpen} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All Categories</SelectItem>
          {categories?.data?.map(category => (
            <SelectItem key={category._id} value={category._id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4">Trending Posts</h3>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  </aside>
);

const Home = () => {
  const [fetchCategories, { data: categories }] = useLazyListCategoriesQuery();
  const { searchTerm } = useSelector(state => state.query);
  const [filters, setFilters] = useState({});
  const { data: posts, isLoading } = useSearchPostsQuery({
    limit: 10,
    page: 1,
    q: searchTerm,
    category: filters.category,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {isLoading ? (
          <SkeletonLoader count={3} />
        ) : (
          posts?.data?.map(post => <PostCard key={post?._id} post={post} />)
        )}
      </div>
      <Sidebar
        categories={categories}
        onOpen={open => open && !categories && fetchCategories()}
        onChange={value => setFilters(prev => ({ ...prev, category: value }))}
      />
    </div>
  );
};

export default Home;
