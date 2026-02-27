import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container max-w-3xl py-16 space-y-8">
      <h1 className="text-3xl font-bold text-foreground text-center">Contact Us</h1>
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="text-center">
          <CardContent className="pt-6 space-y-2">
            <Mail className="mx-auto h-8 w-8 text-primary" />
            <p className="font-medium text-foreground">Email</p>
            <p className="text-sm text-muted-foreground">smarthelp@uc.edu.ph</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 space-y-2">
            <Phone className="mx-auto h-8 w-8 text-primary" />
            <p className="font-medium text-foreground">Phone</p>
            <p className="text-sm text-muted-foreground">09087027436</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 space-y-2">
            <MapPin className="mx-auto h-8 w-8 text-primary" />
            <p className="font-medium text-foreground">Address</p>
            <p className="text-sm text-muted-foreground">Sanciangko St., Cebu City</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default Contact;
