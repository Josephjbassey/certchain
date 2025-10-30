import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Production Error Boundary
 * Catches React component errors and displays user-friendly fallback
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to external service in production
        if (import.meta.env.PROD) {
            this.logErrorToService(error, errorInfo);
        }
    }

    private logErrorToService(error: Error, errorInfo: ErrorInfo) {
        // Log to HCS for audit trail
        try {
            // This would call your logging service
            console.error('Production error logged:', {
                error: error.toString(),
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
            });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full border-destructive/20">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <CardTitle>Something went wrong</CardTitle>
                                    <CardDescription>
                                        We're sorry, but something unexpected happened
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {import.meta.env.DEV && this.state.error && (
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                    <p className="text-sm font-semibold text-destructive">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                                    Try Again
                                </Button>
                                <Button onClick={this.handleReload} className="flex-1 gap-2">
                                    <RefreshCcw className="h-4 w-4" />
                                    Reload Page
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                If this problem persists, please contact support at{' '}
                                <a href="mailto:support@mail.certchain.app" className="text-primary hover:underline">
                                    support@mail.certchain.app
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based error boundary for functional components
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
