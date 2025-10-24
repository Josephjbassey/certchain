import { Shield, Scale, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              <strong>Important:</strong> Please read these Terms of Service carefully before using CertChain.
              By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </CardContent>
        </Card>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By accessing and using CertChain ("the Platform," "we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Your continued use of the Platform following any changes indicates your acceptance of the new terms.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CertChain is a blockchain-based certificate management platform that enables educational institutions, organizations, and individuals to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Issue verifiable digital certificates as NFTs on the Hedera network</li>
              <li>Store certificate metadata on IPFS for permanent, decentralized storage</li>
              <li>Verify the authenticity and validity of certificates</li>
              <li>Manage and track certificate issuance and claims</li>
              <li>Create and maintain Decentralized Identifiers (DIDs)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts and Roles</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Account Registration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 User Roles</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Platform supports the following user roles, each with specific permissions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Super Admin:</strong> Platform administrators with full access to manage institutions</li>
              <li><strong>Institution Admin:</strong> Manage institution settings, staff, and certificate issuance</li>
              <li><strong>Instructor:</strong> Issue certificates to candidates within their institution</li>
              <li><strong>Candidate:</strong> Receive, claim, and manage earned certificates</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Certificate Issuance and Claims</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Institution Responsibilities</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Institutions and instructors using CertChain to issue certificates agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Verify the identity and eligibility of certificate recipients</li>
              <li>Issue certificates only for legitimate achievements and qualifications</li>
              <li>Maintain accurate records of issued certificates</li>
              <li>Not issue fraudulent, misleading, or false certificates</li>
              <li>Handle revocations responsibly and transparently</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Certificate Ownership</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once a certificate is minted as an NFT on the Hedera network:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>The recipient owns the NFT certificate in their Hedera wallet</li>
              <li>The issuing institution retains rights to revoke the certificate if necessary</li>
              <li>Certificate metadata stored on IPFS is permanent and immutable</li>
              <li>Blockchain records are publicly verifiable and cannot be deleted</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Blockchain and Wallet Integration</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Hedera Network</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CertChain uses the Hedera Hashgraph network for certificate issuance. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Blockchain transactions are irreversible once confirmed</li>
              <li>You are responsible for Hedera network fees (gas fees) for transactions</li>
              <li>Network congestion may affect transaction speed</li>
              <li>We do not control the Hedera network or its operations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Wallet Responsibility</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Securing your wallet private keys and recovery phrases</li>
              <li>All transactions made from your connected wallet</li>
              <li>Loss of access to your wallet or private keys</li>
              <li>Unauthorized access to your wallet</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>CertChain cannot recover lost wallets, private keys, or certificate NFTs.</strong>
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Issue fraudulent, fake, or misleading certificates</li>
              <li>Impersonate another person or institution</li>
              <li>Use the Platform for any illegal purpose</li>
              <li>Attempt to hack, breach, or compromise platform security</li>
              <li>Scrape, harvest, or collect user data without permission</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Interfere with or disrupt the Platform's operation</li>
              <li>Resell or redistribute access to the Platform without authorization</li>
              <li>Claim certificates that were not legitimately earned</li>
              <li>Manipulate or falsify verification results</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Platform, including its code, design, logos, and content, is owned by CertChain and protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Copy, modify, or distribute our proprietary code or content</li>
              <li>Use our trademarks without written permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Certificate content and metadata uploaded by institutions remain the property of those institutions.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Fees and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CertChain may charge fees for certain services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Subscription fees for institutions and organizations</li>
              <li>Per-certificate issuance fees</li>
              <li>Premium features and services</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are also responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Hedera network transaction fees</li>
              <li>IPFS storage costs (if applicable)</li>
              <li>Any applicable taxes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing with 30 days' notice.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>CertChain is provided "AS IS" without warranties of any kind</li>
              <li>We do not guarantee uninterrupted, error-free, or secure service</li>
              <li>We are not liable for blockchain network issues or wallet problems</li>
              <li>We are not responsible for certificate content accuracy</li>
              <li>We are not liable for loss of data, profits, or business opportunities</li>
              <li>Our total liability shall not exceed the fees you paid in the last 12 months</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless CertChain, its affiliates, and employees from any claims, damages, losses, or expenses arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your issuance of fraudulent certificates</li>
              <li>Your infringement of third-party rights</li>
              <li>Your negligence or misconduct</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent activity</li>
              <li>Fail to pay applicable fees</li>
              <li>Pose a security risk to the Platform</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your access to the Platform will be revoked</li>
              <li>Certificates already issued remain on the blockchain</li>
              <li>You may export your data within 30 days</li>
              <li>Outstanding fees remain due</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Governing Law and Disputes</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any disputes shall be resolved through:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Good faith negotiation</li>
              <li>Mediation (if negotiation fails)</li>
              <li>Binding arbitration in [Your Jurisdiction]</li>
            </ol>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">13. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of CertChain is also governed by our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline inline-flex items-center gap-1">
                Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </Link>
              , which explains how we collect, use, and protect your data.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <Card className="p-6">
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@certchain.io</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Support:</strong> <Link to="/contact" className="text-primary hover:underline">Contact Form</Link></p>
              </div>
            </Card>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-8 mt-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm">
                  By using CertChain, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link to="/privacy-policy">
            <Button variant="default">View Privacy Policy</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
