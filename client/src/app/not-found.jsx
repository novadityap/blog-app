'use client'

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg p-6 shadow-md">
        <CardHeader>
          <h1 className="text-4xl text-center font-bold text-gray-800">
            Page Not Found
          </h1>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mt-4">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might
            have been moved or deleted.
          </p>
          <Image 
            width={500}
            height={500}
            src="/404.jpg"
            alt="404 Not Found"
            className="w-full mt-6 rounded-md"
          />
        </CardContent>
        <CardFooter className="flex justify-center mt-6">
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
