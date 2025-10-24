import { FileText, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const Templates = () => {
  const { user } = useAuth();

  // Get user's institution
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user?.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  // Fetch templates from certificate_cache metadata
  // In production, you'd have a separate templates table
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];
      
      // Get unique course names as templates
      const { data: certificates } = await supabase
        .from('certificate_cache')
        .select('course_name, created_at, metadata')
        .eq('institution_id', profile.institution_id)
        .order('created_at', { ascending: false });
      
      // Group by course name to create template summaries
      const templateMap = new Map();
      certificates?.forEach(cert => {
        const existing = templateMap.get(cert.course_name);
        if (existing) {
          existing.usageCount++;
          if (new Date(cert.created_at || '') > new Date(existing.lastUsed)) {
            existing.lastUsed = cert.created_at;
          }
        } else {
          templateMap.set(cert.course_name, {
            id: cert.course_name,
            name: cert.course_name,
            description: `Template for ${cert.course_name} certificates`,
            lastUsed: cert.created_at,
            usageCount: 1
          });
        }
      });
      
      return Array.from(templateMap.values());
    },
    enabled: !!profile?.institution_id
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Certificate Templates</h1>
          <p className="text-muted-foreground">Create and manage certificate templates</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Used {template.usageCount} times</span>
                  <span>Last used {formatDate(template.lastUsed)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed flex items-center justify-center min-h-[200px]">
            <Button variant="ghost" className="flex-col h-auto py-8">
              <Plus className="h-12 w-12 mb-2 text-muted-foreground" />
              <span className="text-muted-foreground">Create New Template</span>
            </Button>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first certificate template to get started
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Template Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Templates define the layout and styling of your certificates</p>
          <p>• Use dynamic fields to automatically populate recipient information</p>
          <p>• All templates are stored on-chain for immutability</p>
          <p>• Preview templates before issuing certificates</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Templates;
