import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";

const AiConsole = () => {
  const { dashboardPath } = useRoleBasedNavigation();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResponse("AI functionality has been disabled for the pure dApp migration.");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={dashboardPath} className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain AI Console
            </span>
          </Link>
          <Link to={dashboardPath}>
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question about certificate management..."
          className="mb-4 h-32"
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? "Generating..." : "Generate response"}
        </Button>
        {response && (
          <div className="mt-8 p-6 bg-card rounded-xl border border-border">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AiConsole;
