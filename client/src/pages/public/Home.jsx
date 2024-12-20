import { useGetPostsQuery } from '@/services/postApi';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useLazyGetCategoriesQuery } from '@/services/categoryApi';
  
const Home = () => {
  const [getCategories, { data: categories }] = useLazyGetCategoriesQuery();
  const { searchTerm } = useSelector(state => state.ui);
  const { filters } = useSelector(state => state.ui);
  const { data: posts, isLoading } = useGetPostsQuery({
    limit: 10,
    page: 1,
    search: searchTerm,
    category: filters?.category,
  });

  const totalSkeletons = posts?.meta?.totalItems || 5; 

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
        {[...Array(totalSkeletons)].map((_, index) => (
          <div key={index} className="w-full">
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center min-h-screen lg:space-x-4 p-4">
      <div className="flex-1 flex flex-col items-center space-y-4">
        {posts?.data?.map((post) => (
          <Card key={post?._id} className="w-full max-w-2xl mb-4">
            <CardHeader className="space-y-4">
              <CardTitle className="capitalize">
                <Link to={`/post/${post?.slug}`}>{post?.title}</Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={post?.userId?.avatar}
                    alt={post?.userId?.username}
                  />
                  <AvatarFallback>
                    {post?.userId?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{post?.userId?.username}</span>
                <span className="text-sm text-gray-500">
                  {new Date(post?.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={`/post/${post?.slug}`} className="text-gray-700">
                <img
                  src={post?.postImage}
                  alt={post?.title}
                  className="w-full h-48 object-cover mb-4 rounded-md lg:h-64"
                />
              </Link>
              <div
                dangerouslySetInnerHTML={{ __html: post?.content }}
                className="line-clamp-1 text-sm"
              />
            </CardContent>
            <CardFooter>
              <Button asChild variant="primary">
                <Link to={`/post/${post?.slug}`} className="text-gray-700">
                  Read more
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="w-full lg:w-64 mt-6 lg:mt-0">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Category</h2>
          <Select
            onOpenChange={(isOpen) => {
              if (isOpen) getCategories();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.data?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trending Posts Placeholder */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Trending Posts</h3>
          {/* Add any additional elements like cards for trending posts */}
        </div>
      </div>
    </div>
  );
};

export default Home;
