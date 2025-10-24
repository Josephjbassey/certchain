import { Users, UserPlus, Search, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Recipients = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const exampleRecipients = [
    { id: 1, name: "John Doe", email: "john@example.com", certificates: 3, lastIssued: "2024-10-20" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", certificates: 5, lastIssued: "2024-10-18" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", certificates: 2, lastIssued: "2024-10-15" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recipients Management</h1>
          <p className="text-muted-foreground">Manage certificate recipients and their credentials</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Recipient
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Recipients</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <CardDescription>
            {exampleRecipients.length} recipients total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Certificates</TableHead>
                <TableHead>Last Issued</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exampleRecipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell className="font-medium">{recipient.name}</TableCell>
                  <TableCell>{recipient.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{recipient.certificates}</Badge>
                  </TableCell>
                  <TableCell>{recipient.lastIssued}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exampleRecipients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exampleRecipients.reduce((sum, r) => sum + r.certificates, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Recipients;
