import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useShowDashboardQuery } from '@/services/dashboardApi';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { data, isLoading } = useShowDashboardQuery();

  return (
    <>
      <BreadcrumbNav />
      <h1 className="mb-4 text-2xl font-semibold">Dashboard Overview</h1>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Total Users
                </CardTitle>
                <CardDescription className="text-2xl text-gray-600">
                  {data?.data?.totalUsers}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Total Posts
                </CardTitle>
                <CardDescription className="text-2xl text-gray-600">
                  {data?.data?.totalPosts}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Total Comments
                </CardTitle>
                <CardDescription className="text-2xl text-gray-600">
                  {data?.data?.totalComments}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Total Categories
                </CardTitle>
                <CardDescription className="text-2xl text-gray-600">
                  {data?.data?.totalCategories}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Total Roles
                </CardTitle>
                <CardDescription className="text-2xl text-gray-600">
                  {data?.data?.totalRoles}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Total Permissions
                </CardTitle>
                <CardDescription className="text-2xl text-gray-600">
                  {data?.data?.totalPermissions}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 text-gray-700">
                  {data?.data?.recentPosts.map(post => (
                    <li key={post._id}>
                      {post.title} - by <span className="font-semibold">{post.userId.username}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard/posts" className="block mt-4 text-blue-600 hover:underline" >View All Posts</Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Recent Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 text-gray-700">
                  {data?.data?.recentComments.map(comment => (
                    <li key={comment._id}>
                      {comment.content} on &quot;{comment.postId.title}&quot; by{' '}
                      {comment.userId.username}
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard/comments" className="block mt-4 text-blue-600 hover:underline" >View All Comments</Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
