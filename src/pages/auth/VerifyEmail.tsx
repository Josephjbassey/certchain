import { Link } from "react-router-dom";
export default function VerifyEmail() {
  return <div className="p-8 text-center"><h1 className="text-2xl">Email Verification not needed for Wallet Auth</h1><Link to="/dashboard" className="text-primary mt-4 block">Go to Dashboard</Link></div>;
}
