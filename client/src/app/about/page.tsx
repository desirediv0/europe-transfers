import { IconCar, IconShield, IconHeart, IconUsers, IconMapPin, IconPhone, IconCheck, IconBuilding, IconClock } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  { icon: IconCar, title: "Premium Vehicles", desc: "Our fleet consists of well-maintained, modern vehicles suitable for all group sizes and travel needs across Europe." },
  { icon: IconShield, title: "Safety First", desc: "All our drivers are licensed, experienced, and undergo regular background checks for your complete peace of mind." },
  { icon: IconHeart, title: "Customer Care", desc: "We prioritize your comfort and satisfaction, offering personalized service and 24/7 support for every journey." },
  { icon: IconUsers, title: "Expert Team", desc: "Our team of travel experts curates the best routes, packages, and experiences across Europe's top destinations." },
];

const stats = [
  { value: "10,000+", label: "Happy Travelers" },
  { value: "500+", label: "Routes Covered" },
  { value: "50+", label: "European Cities" },
  { value: "4.9", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/30" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-6">
            <IconBuilding className="h-4 w-4" />
            About Us
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Your Trusted <span className="text-gold">European</span> Travel Partner
          </h1>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
            The Europe Transfers connects travelers with premium, reliable, and comfortable transportation across Europe&apos;s most iconic destinations.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">Our Values</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Why We Do What We Do</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Everything we build is centered around one goal: making your European journey seamless and memorable.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item) => (
            <Card
              key={item.title}
              className="group border-border/40 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-gold/20"
            >
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 transition-all duration-300 group-hover:scale-110 group-hover:from-gold/20">
                  <item.icon className="h-8 w-8 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">Our Mission</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Redefining European Travel</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We believe travel should be effortless. From the moment you land to the moment you reach your destination, our goal is to provide a premium, stress-free experience that lets you focus on enjoying the journey.
              </p>
              <ul className="mt-6 space-y-3">
                {["Fixed transparent pricing", "Professional local drivers", "Easy online booking", "Round-the-clock support"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10">
                      <IconCheck className="h-3.5 w-3.5 text-gold" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-40 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                  <IconCar className="h-12 w-12 text-gold/60" strokeWidth={1.5} />
                </div>
                <div className="h-56 rounded-2xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                  <IconMapPin className="h-12 w-12 text-white/30" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-56 rounded-2xl bg-gradient-to-br from-navy-light to-navy flex items-center justify-center">
                  <IconClock className="h-12 w-12 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="h-40 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                  <IconPhone className="h-12 w-12 text-gold/60" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
