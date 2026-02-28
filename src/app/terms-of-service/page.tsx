import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-[#A92FFA]">Legal</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Terms of Service
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
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing or using our website and services, you agree to be bound by these Terms of Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>UCon Ministries provides faith-based services including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Leadership Development Institute (LDI) programs</li>
                <li>Open ministry services</li>
                <li>Community outreach programs</li>
                <li>Prayer support and spiritual guidance</li>
                <li>Event hosting and volunteer opportunities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>When using our services, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information</li>
                <li>Respect the rights and safety of others</li>
                <li>Follow all program rules and guidelines</li>
                <li>Not engage in disruptive or illegal behavior</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>If you have questions about these Terms:</p>
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