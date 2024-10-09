import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1); 
  const handleGoHome = () => navigate("/"); 

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button onClick={handleGoHome}>
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
