import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { Phone, MapPin, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function Contact() {
  return (
    <>
      <Seo 
        title={`Contact Us | ${DEALERSHIP.name}`}
        description="Call or visit our dealership today to test drive a DENAGO electric vehicle. We offer full sales, service, and support."
        url={`${DEALERSHIP.domain}/contact`}
      />

      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
                CONTACT <span className="text-primary">US</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Ready to electrify your ride? Our team is standing by to answer your questions and schedule a test drive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Primary Contact CTA */}
              <div className="bg-card border border-border p-8 md:p-12 rounded-2xl shadow-xl flex flex-col justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                
                <h2 className="text-3xl font-display font-bold mb-6 relative z-10">CALL SALES DIRECT</h2>
                <p className="text-muted-foreground mb-10 relative z-10">Skip the forms and get immediate answers. Call our knowledgeable sales staff today.</p>
                
                <a 
                  href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transform px-8 py-6 rounded-xl font-bold text-2xl md:text-3xl flex items-center justify-center gap-4 transition-all shadow-lg shadow-primary/25 mx-auto w-full max-w-md relative z-10"
                >
                  <Phone className="h-8 w-8" />
                  {DEALERSHIP.phoneDisplay}
                </a>

                <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium relative z-10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Authorized DENAGO Dealer
                </div>
              </div>

              {/* Info Blocks */}
              <div className="flex flex-col gap-6">
                <div className="bg-background border border-border p-8 rounded-2xl flex items-start gap-6">
                  <div className="bg-secondary p-4 rounded-full text-primary shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-display uppercase">Location</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      123 Electric Ave<br />
                      Austin, TX 78701<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="bg-background border border-border p-8 rounded-2xl flex items-start gap-6">
                  <div className="bg-secondary p-4 rounded-full text-primary shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="w-full">
                    <h3 className="text-xl font-bold mb-4 font-display uppercase">Showroom Hours</h3>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 text-muted-foreground">
                      <span>Monday - Friday</span>
                      <span className="font-bold text-foreground">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 text-muted-foreground">
                      <span>Saturday</span>
                      <span className="font-bold text-foreground">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-muted-foreground">
                      <span>Sunday</span>
                      <span className="font-bold text-muted-foreground">Closed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border p-8 rounded-2xl flex items-start gap-6">
                  <div className="bg-secondary p-4 rounded-full text-primary shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-display uppercase">Email Us</h3>
                    <a href="mailto:sales@denagodealership.com" className="text-primary hover:underline font-medium">
                      sales@denagodealership.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">For service inquiries, please call.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
