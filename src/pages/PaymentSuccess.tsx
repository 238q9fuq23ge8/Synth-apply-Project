import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-6">
      <div className="max-w-md w-full text-center animate-scale-in">
        <div className="glass-card p-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Your subscription has been activated. You can now enjoy all premium features.
          </p>

          <div className="space-y-3">
            <Link to="/dashboard">
              <Button className="btn-gradient w-full">
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/upload-cv">
              <Button variant="outline" className="w-full">
                Upload Your CV
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
