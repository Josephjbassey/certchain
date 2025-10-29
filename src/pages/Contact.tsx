import { Shield, Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We're here to help you get started with CertChain
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="p-8 shadow-elevated">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your needs..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <MessageSquare className="h-4 w-4" />
                    <span className="ml-2">Send Message</span>
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 gradient-card">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground mb-2">Our team is here to help</p>
                    <a href="mailto:support@certchain.app" className="text-primary hover:underline">
                      support@certchain.app
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground mb-2">Mon-Fri 9am to 6pm WAT</p>
                    <a href="tel:+2349066469867" className="text-primary hover:underline">
                      +239 (906) 646-9867
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office</h3>
                    <p className="text-sm text-muted-foreground">
                      4 Fadogba Street, Ifelodun Estate<br />
                      Adjacent Alejolowo Block Industry<br />
                      Along FUTA North Gate<br />
                      Akure, Ondo State 340110<br />
                      Nigeria
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30">
                <h3 className="font-semibold mb-3">Enterprise Solutions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need a custom solution for your organization? Our team can help design
                  and implement a tailored certificate management system.
                </p>
                <Button variant="outline" className="w-full">
                  Schedule a Demo
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
