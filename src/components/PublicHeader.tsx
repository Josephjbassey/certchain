import { Shield, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

export const PublicHeader = () => {
    const { user, signOut } = useAuth();
    const { data: userRole } = useUserRole();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getDashboardPath = (role: UserRole | null) => {
        if (!role) return "/dashboard";
        switch (role) {
            case "super_admin": return "/admin/dashboard";
            case "institution_admin": return "/institution/dashboard";
            case "instructor": return "/instructor/dashboard";
            case "candidate": return "/candidate/dashboard";
            default: return "/dashboard";
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        CertChain
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/verify" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                        Verify
                    </Link>
                    <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                        Pricing
                    </Link>
                    <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                        Docs
                    </Link>
                    <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                        About
                    </Link>
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    {user ? (
                        <>
                            <Link to={getDashboardPath(userRole)}>
                                <Button variant="ghost" size="sm">Dashboard</Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <User className="h-4 w-4" />
                                        Account
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => navigate("/settings/account")}>
                                        <User className="h-4 w-4 mr-2" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link to="/auth/signup">
                                <Button variant="hero" size="sm">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        <Link
                            to="/verify"
                            className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Verify
                        </Link>
                        <Link
                            to="/pricing"
                            className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Pricing
                        </Link>
                        <Link
                            to="/docs"
                            className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Docs
                        </Link>
                        <Link
                            to="/about"
                            className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About
                        </Link>

                        <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Theme</span>
                                <ThemeToggle />
                            </div>
                            {user ? (
                                <>
                                    <Link to={getDashboardPath(userRole)} onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link to="/settings/account" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <User className="h-4 w-4 mr-2" />
                                            Settings
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            handleSignOut();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                                    </Link>
                                    <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="hero" size="sm" className="w-full">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};
