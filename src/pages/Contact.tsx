import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, User } from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
        toast.success("Message sent successfully!");
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 relative">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

        <div className="max-w-2xl w-full z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have questions about CertChain? We're here to help.
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 border border-primary/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2" htmlFor="name">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="bg-background/50 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2" htmlFor="email">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-background/50 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2" htmlFor="message">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  required
                  className="min-h-[150px] bg-background/50 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 border-2 border-current border-t-transparent rounded-full w-5 h-5"></span>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Send Message
                    <Send className="ml-2 w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>


    </div>
  );
}
