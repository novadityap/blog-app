import { useShowPostQuery } from '@/services/postApi';
import {
  useCreateCommentMutation,
  useListCommentsByPostQuery,
} from '@/services/commentApi';
import { useLikePostMutation } from '@/services/postApi';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { useEffect } from 'react';
import { AspectRatio } from '@/components/shadcn-ui/aspect-ratio';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/shadcn-ui/form';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn-ui/avatar';
import { useState } from 'react';
import dayjs from 'dayjs';
import { TbLoader, TbInfoCircle, TbHeartFilled } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';

const CreateComment = ({
  avatarUrl,
  postId,
  parentCommentId = null,
  isReply = false,
  onCancelReply,
  replyTo,
  className,
}) => {
  const { form, handleSubmit, isLoading, isSuccess } = useFormHandler({
    ids: { postId, parentCommentId },
    mutation: useCreateCommentMutation,
    defaultValues: {
      postId,
      parentCommentId,
      text: replyTo || '',
    },
  });

  useEffect(() => {
    if (isSuccess && isReply) onCancelReply();
  }, [isSuccess, isReply, onCancelReply]);

  return (
    <div className={cn('flex w-full gap-x-4', className)}>
      <Avatar className={isReply ? 'size-8' : 'size-10'}>
        <AvatarImage src={avatarUrl} alt="avatar" />
        <AvatarFallback>{avatarUrl?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <FormField
            name="text"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Add a comment..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-x-2">
            {isReply && (
              <Button type="button" onClick={onCancelReply} variant="secondary">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-32"
            >
              {isLoading ? (
                <>
                  <TbLoader className="animate-spin mr-2 size-5" />
                  Loading...
                </>
              ) : isReply ? (
                'Reply'
              ) : (
                'Comment'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const Comments = ({ comments, postId, token }) => {
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const getReplies = parentId =>
    comments.filter(c => c.parentCommentId === parentId);

  return (
    <div className="flex flex-col w-full gap-y-2">
      {topLevelComments.map(comment => (
        <div key={comment._id} className="flex gap-x-4">
          <Avatar className="size-10 mt-2">
            <AvatarImage
              src={comment.userId.avatar}
              alt={comment.userId.username}
            />
            <AvatarFallback>
              {comment.userId.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {comment.userId.username}
            </p>
            <p className="text-gray-600 text-sm">{comment.text}</p>
            {token && (
              <Button
                variant="ghost"
                className="text-sm text-black font-semibold mt-2 px-4 py-2 h-8 rounded-xl hover:bg-slate-200"
                onClick={() => setReplyToCommentId(comment._id)}
              >
                Reply
              </Button>
            )}
            {replyToCommentId === comment._id && (
              <CreateComment
                avatarUrl={comment.userId.avatar}
                isReply={true}
                postId={postId}
                parentCommentId={comment._id}
                onCancelReply={() => setReplyToCommentId(null)}
                className="mt-2"
              />
            )}
            <div className="flex flex-col w-full gap-y-2">
              {getReplies(comment._id).map(reply => (
                <div key={reply._id}>
                  <div className="flex gap-x-4">
                    <Avatar className="size-8 mt-2">
                      <AvatarImage
                        src={reply.userId.avatar}
                        alt={reply.userId.username}
                      />
                      <AvatarFallback>
                        {reply.userId.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {reply.userId.username}
                      </p>
                      <p className="text-gray-600 text-sm">{reply.text}</p>
                      {token && (
                        <Button
                          variant="ghost"
                          className="text-sm text-black font-semibold mt-2 px-4 py-2 h-8 rounded-xl hover:bg-slate-200"
                          onClick={() => setReplyToCommentId(reply._id)}
                        >
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                  {replyToCommentId === reply._id && (
                    <CreateComment
                      avatarUrl={reply.userId.avatar}
                      isReply={true}
                      postId={postId}
                      parentCommentId={comment._id}
                      onCancelReply={() => setReplyToCommentId(null)}
                      replyTo={`@${reply.userId.username} `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PostDetailSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-2/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full rounded-md" />
      <Skeleton className="h-6 w-1/2 mt-4" />
      <Skeleton className="h-4 w-full mt-2" />
    </CardContent>
  </Card>
);

const CommentsSkeleton = () => {
  return (
    <div className="flex flex-col w-full gap-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex gap-x-4">
          <Skeleton className="size-10 rounded-full mt-2" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-6 w-16 mt-2 rounded-xl" />

            <div className="mt-4 flex flex-col gap-y-2">
              {[...Array(1)].map((_, j) => (
                <div key={j} className="flex gap-x-4 ml-10">
                  <Skeleton className="size-8 rounded-full mt-1" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-full max-w-sm" />
                    <Skeleton className="h-6 w-14 mt-1 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const LikeButton = ({ likes, onLike, currentUser, totalLikes, navigate }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(likes.includes(currentUser.id));
  }, [likes, currentUser]);

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-x-2 text-sm p-0 hover:no-underline hover:bg-transparent"
      onClick={onLike}
    >
      <TbHeartFilled
        className={cn('size-8', isLiked ? 'text-red-500' : 'text-gray-500')}
      />
      <span className="text-sm text-gray-500">{totalLikes} Likes</span>
    </Button>
  );
};

const PostDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, currentUser } = useSelector(state => state.auth);
  const postId = location.state.postId;
  const [likePost] = useLikePostMutation();
  const { data: comments, isLoading: isLoadingComments } =
    useListCommentsByPostQuery(postId);
  const {
    data: post,
    isLoading: isLoadingPost,
    error,
  } = useShowPostQuery(String(postId), {
    refetchOnMountOrArgChange: true,
  });

  const handleLike = () => {
    if (!token) {
      navigate('/signin');
    } else {
      likePost(post?.data?._id);
    }
  };

  useEffect(() => {
    if (!isLoadingPost && !post) {
      navigate('/404');
    }
  }, [isLoadingPost, post, navigate]);

  if (isLoadingPost) return <PostDetailSkeleton />;

  if (error || !post) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-red-500 font-semibold">
            Failed to load the post. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex items-center gap-x-2 mb-6">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={post?.data?.userId?.avatar}
              alt={post?.data?.userId?.username}
            />
            <AvatarFallback>
              {post?.data?.userId?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardDescription className="font-semibold capitalize">
              {post?.data?.userId?.username}
            </CardDescription>
            <CardDescription className="text-sm text-gray-500">
              <span className="text-gray-600">Published on </span>
              {dayjs(post?.data?.createdAt).format('DD MMMM YYYY hh:mm A')}
            </CardDescription>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold capitalize text-gray-800">
          {post?.data?.title}
        </CardTitle>
        {post?.data?.category && (
          <CardDescription className="text-sm text-gray-500">
            Category: {post?.data?.category?.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-justify">
        <AspectRatio ratio={16 / 9}>
          <img
            src={post?.data?.postImage}
            alt={post?.data?.title}
            className="size-full"
          />
        </AspectRatio>
        <div dangerouslySetInnerHTML={{ __html: post?.data?.content }} />
        <LikeButton
          onLike={handleLike}
          navigate={navigate}
          token={token}
          currentUser={currentUser}
          likes={post?.data?.likes}
          totalLikes={post?.data?.totalLikes}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-y-6">
        {token ? (
          <CreateComment
            avatarUrl={
              post?.data?.userId?.avatar || import.meta.env.VITE_API_URL
            }
            postId={post?.data?._id}
          />
        ) : (
          <div className="flex items-center gap-3 p-4 border border-border bg-slate-200/ rounded-xl">
            <TbInfoCircle className="size-8 text-muted-foreground mt-1" />
            <p className="text-sm text-muted-foreground">
              You must{' '}
              <NavLink to="/signin" className="text-blue-500">
                Sign in
              </NavLink>{' '}
              to post a comment.
            </p>
          </div>
        )}

        {isLoadingComments ? (
          <CommentsSkeleton />
        ) : (
          <Comments
            token={token}
            comments={comments?.data}
            postId={post?.data?._id}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PostDetail;
