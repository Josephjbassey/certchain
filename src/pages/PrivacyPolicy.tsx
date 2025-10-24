import { Shield, Eye, Lock, Server, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const lastUpdated = "October 24, 2025";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              <strong>Your Privacy Matters:</strong> CertChain is committed to protecting your personal information
              and being transparent about how we collect, use, and safeguard your data.
            </p>
          </CardContent>
        </Card>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This Privacy Policy explains how CertChain ("we," "us," or "our") collects, uses, discloses, and protects your information when you use our blockchain-based certificate management platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using CertChain, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use the Platform.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you register and use CertChain, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Account Information:</strong> Name, email address, password (hashed), profile photo</li>
              <li><strong>Institution Information:</strong> Institution name, domain, description, Hedera account ID</li>
              <li><strong>Certificate Data:</strong> Certificate titles, descriptions, issue dates, recipient information</li>
              <li><strong>DID Information:</strong> Decentralized Identifier (DID) documents and public keys</li>
              <li><strong>Wallet Information:</strong> Hedera wallet account IDs (not private keys)</li>
              <li><strong>Communication Data:</strong> Support requests, feedback, and correspondence</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Information Automatically Collected</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We automatically collect certain information when you use the Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>IP Address:</strong> Your internet protocol address and approximate location</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              <li><strong>Security Logs:</strong> Login attempts, authentication events, security incidents</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Blockchain Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When certificates are issued on the Hedera network:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Public Blockchain Records:</strong> NFT token IDs, transaction hashes, timestamps</li>
              <li><strong>IPFS Metadata:</strong> Certificate content stored on InterPlanetary File System</li>
              <li><strong>HCS Logs:</strong> Audit logs recorded on Hedera Consensus Service</li>
            </ul>
            <Card className="mt-4 border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Blockchain data is public, permanent, and immutable. Once recorded, it cannot be deleted or modified.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use collected information for the following purposes:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Service Delivery</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Create and manage your account</li>
              <li>Process certificate issuance and claims</li>
              <li>Connect your Hedera wallet</li>
              <li>Verify certificate authenticity</li>
              <li>Enable DID creation and management</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Platform Improvement</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Analyze usage patterns and trends</li>
              <li>Improve features and user experience</li>
              <li>Develop new services and functionality</li>
              <li>Test and debug platform issues</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Communication</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Send transactional emails (certificate issued, claimed)</li>
              <li>Provide customer support</li>
              <li>Send security alerts and important updates</li>
              <li>Respond to inquiries and requests</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.4 Security and Compliance</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Prevent fraud and abuse</li>
              <li>Enforce Terms of Service</li>
              <li>Comply with legal obligations</li>
              <li>Protect user safety and platform integrity</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 With Your Consent</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We share information when you explicitly authorize us to do so, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Publishing certificates with public visibility settings</li>
              <li>Sharing credentials with third-party verifiers</li>
              <li>Connecting with external services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We work with trusted third-party providers who assist in operating the Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Supabase:</strong> Database, authentication, and backend infrastructure</li>
              <li><strong>Hedera:</strong> Blockchain network for NFT minting and consensus</li>
              <li><strong>Pinata (IPFS):</strong> Decentralized storage for certificate metadata</li>
              <li><strong>Analytics Providers:</strong> Usage analytics and performance monitoring</li>
              <li><strong>Email Services:</strong> Transactional email delivery</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These providers are contractually obligated to protect your data and use it only for specified purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may disclose information if required by law or in response to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Court orders, subpoenas, or legal processes</li>
              <li>Government or regulatory requests</li>
              <li>Investigation of suspected fraud or illegal activity</li>
              <li>Protection of our rights, property, or safety</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Public Blockchain Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              Certificate data recorded on the Hedera blockchain and IPFS is publicly accessible and permanently stored. This includes NFT metadata, transaction records, and consensus logs.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your information for as long as necessary to provide services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Account Data:</strong> Retained until you delete your account, plus 90 days for backups</li>
              <li><strong>Certificate Records:</strong> Retained for 7 years for compliance and verification</li>
              <li><strong>Transaction Logs:</strong> Retained for 3 years for audit and security purposes</li>
              <li><strong>Blockchain Data:</strong> Permanent and cannot be deleted (stored on Hedera and IPFS)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              When you delete your account, we remove your personal information from active databases within 90 days, except where retention is required by law.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              6. Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Technical Safeguards</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Authentication:</strong> Secure password hashing (bcrypt), optional 2FA</li>
              <li><strong>Access Controls:</strong> Role-based permissions and least-privilege principles</li>
              <li><strong>Security Monitoring:</strong> Intrusion detection, vulnerability scanning, audit logs</li>
              <li><strong>Secure Infrastructure:</strong> Hosted on secure, compliant cloud providers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Organizational Safeguards</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Employee background checks and confidentiality agreements</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Regular security training and awareness programs</li>
              <li>Incident response and breach notification procedures</li>
            </ul>

            <Card className="mt-4 border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> No method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. You are responsible for securing your account credentials and wallet private keys.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Access and Portability</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Export:</strong> Download your data in a machine-readable format</li>
              <li><strong>Portability:</strong> Transfer your data to another service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Correction and Deletion</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Update:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Delete:</strong> Request deletion of your account and personal data</li>
              <li><strong>Restrictions:</strong> Blockchain data cannot be deleted (immutable records)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.3 Privacy Controls</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control your privacy settings in the Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Profile Visibility:</strong> Set to Public, Verified Only, or Private</li>
              <li><strong>Certificate Display:</strong> Control who can see your certificates</li>
              <li><strong>Email Display:</strong> Hide or show your email address</li>
              <li><strong>Search Indexing:</strong> Opt out of search engine indexing</li>
              <li><strong>Analytics:</strong> Disable usage analytics tracking</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.4 Communication Preferences</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Unsubscribe from marketing emails (required emails cannot be disabled)</li>
              <li>Manage notification preferences</li>
              <li>Control security alert settings</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CertChain uses cookies and similar tracking technologies:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Types of Cookies</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
              <li><strong>Analytics Cookies:</strong> Track usage patterns and performance (opt-out available)</li>
              <li><strong>Security Cookies:</strong> Detect fraud and protect against abuse</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Third-Party Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Third-party services may set their own cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Performance monitoring services</li>
              <li>Social media plugins (if applicable)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Managing Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              9. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CertChain operates globally, and your information may be transferred to and processed in countries other than your own.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>We use secure cloud infrastructure providers (Supabase, AWS, etc.)</li>
              <li>Data transfers comply with applicable data protection laws</li>
              <li>We implement standard contractual clauses for international transfers</li>
              <li>Blockchain data is distributed globally by design (Hedera network, IPFS)</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CertChain is not directed to children under 13 years of age (or 16 in the EU). We do not knowingly collect personal information from children.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you believe a child has provided us with personal information, please contact us immediately, and we will delete such information.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Educational institutions may issue certificates to minors as part of their programs. In such cases, the institution is responsible for obtaining necessary parental consent.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Changes in our practices or services</li>
              <li>Legal or regulatory requirements</li>
              <li>Feedback from users and stakeholders</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Email notification to registered users</li>
              <li>Prominent notice on the Platform</li>
              <li>Updating the "Last Updated" date at the top of this policy</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Your continued use of CertChain after changes indicates acceptance of the updated policy.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <p className="font-semibold mb-1">Email:</p>
                  <p>privacy@certchain.io</p>
                </div>
                <div className="text-muted-foreground">
                  <p className="font-semibold mb-1">Data Protection Officer:</p>
                  <p>dpo@certchain.io</p>
                </div>
                <div className="text-muted-foreground">
                  <p className="font-semibold mb-1">Mailing Address:</p>
                  <p>[Your Business Address]</p>
                  <p>[City, State, ZIP Code]</p>
                  <p>[Country]</p>
                </div>
                <div className="text-muted-foreground">
                  <p className="font-semibold mb-1">Support:</p>
                  <p>
                    <Link to="/contact" className="text-primary hover:underline">
                      Contact Form
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will respond to your inquiries within 30 days (or as required by applicable law).
            </p>
          </section>

          {/* Regional Compliance */}
          <section>
            <h2 className="text-2xl font-bold mb-4">13. Regional-Specific Information</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">13.1 California Residents (CCPA)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              California residents have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">13.2 European Residents (GDPR)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              EU/EEA residents have rights under the General Data Protection Regulation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Right to access, rectify, and erase personal data</li>
              <li>Right to data portability</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Our lawful basis for processing includes consent, contract performance, legal obligations, and legitimate interests.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-8 mt-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm">
                  By using CertChain, you acknowledge that you have read and understood this Privacy Policy
                  and agree to the collection, use, and disclosure of your information as described herein.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link to="/terms-of-service">
            <Button variant="default">View Terms of Service</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
