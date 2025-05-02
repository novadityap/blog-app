import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/shadcn-ui/card"; 
import { Button } from "@/components/shadcn-ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100 px-4">
      <Card className="w-full max-w-md p-6 shadow-xl border border-red-200">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <AlertTriangle className="text-red-500 w-10 h-10" />
          <CardTitle className="text-2xl font-semibold text-red-600">
            Unauthorized Access
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-600">
          <p>You don&apos;t have permission to view this page.</p>
          <p className="mt-2 text-sm text-gray-500">
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button onClick={handleGoHome}>
            Go to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
