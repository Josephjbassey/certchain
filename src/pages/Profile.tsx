import { useParams, Link } from "react-router-dom";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Profile = () => {
  const { accountId } = useParams();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Shield className="h-8 w-8 text-primary" /><span className="text-2xl font-bold">CertChain</span></Link>
          <Link to="/"><Button variant="ghost" size="sm">Home</Button></Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-8">Profile {accountId}</h1><Card className="p-6 text-center"><User className="h-12 w-12 text-primary mx-auto mb-3" /><p>Public profile</p></Card></div>
    </div>
  );
};
export default Profile;
