import { useState } from "react";
import { Shield, Send, Bot, User, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AiConsole = () => {
  const { dashboardPath } = useRoleBasedNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hello! I'm the CertChain AI assistant. I can help you with:\n\n• Certificate issuance and management\n• Blockchain verification queries\n• Hedera network operations\n• Best practices and guidance\n\nHow can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // NOTE: AI assistant integration placeholder
      // Recommended approach:
      // 1. Create Supabase Edge Function 'ai-assistant'
      // 2. Integrate with OpenAI API, Anthropic Claude, or open-source LLM
      // 3. Provide context about CertChain operations, Hedera network
      // 4. Stream responses for better UX
      // Implementation:
      // const { data, error } = await supabase.functions.invoke('ai-assistant', {
      //   body: { message: userMessage, context: 'certchain' }
      // });
      // For now, show placeholder response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I'm currently in development mode. AI integration will be available soon!"
        }]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CertChain AI
              </span>
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link to={dashboardPath}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              AI Console
            </h1>
            <p className="text-muted-foreground">
              AI-powered assistant for certificate management and blockchain operations
            </p>
          </div>

          <Card className="flex-1 flex flex-col gradient-card shadow-elevated">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">{messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0 shadow-glow">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-[75%] shadow-sm ${message.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground"
                      : "bg-card border border-border"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
                      <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                    </div>
                    <div className="rounded-2xl px-5 py-3 bg-card border border-border">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
                  placeholder="Ask me anything about certificates or Hedera..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: AI integration coming soon. Currently in development mode.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AiConsole;
