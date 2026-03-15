import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-[#A92FFA]">Legal</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                UCon Ministries collects information that you provide directly to us when you use our services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number, and mailing address</li>
                <li>Prayer requests and testimonies you submit</li>
                <li>Event registration information</li>
                <li>Volunteer application details</li>
                <li>Donation and payment information</li>
                <li>Communication preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services and programs</li>
                <li>Process event registrations and volunteer applications</li>
                <li>Send you updates and information about our ministry</li>
                <li>Respond to your prayer requests</li>
                <li>Process donations</li>
                <li>Communicate with you about programs and events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We do not sell, trade, or rent your personal information to third parties.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>If you have questions about this Privacy Policy:</p>
              <div className="space-y-2 mt-4">
                <p><strong>UCon Ministries</strong></p>
                <p>Email: info@uconministries.org</p>
                <p>Phone: 720.663.9243</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}