import { Card, CardHeader, CardContent, CardFooter } from "@/components/shadcn-ui/card"; 
import { Button } from "@/components/shadcn-ui/button";
import { useNavigate } from "react-router-dom";
import notFound from '@/assets/notFound.jpg';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg p-6 shadow-md">
        <CardHeader>
          <h1 className="text-4xl font-bold text-gray-800">404 - Page Not Found</h1>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mt-4">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
          </p>
          <img 
            src={notFound}
            alt="404 Not Found"
            className="w-full mt-6 rounded-md"
          />
        </CardContent>
        <CardFooter className="flex justify-center mt-6">
          <Button onClick={() => navigate("/")} className="bg-blue-600 text-white">
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
