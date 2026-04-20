import { Link } from "react-router-dom";
export default function TwoFactor() {
  return <div className="p-8 text-center"><h1 className="text-2xl">2FA setup not needed for Wallet Auth</h1><Link to="/dashboard" className="text-primary mt-4 block">Go to Dashboard</Link></div>;
}
