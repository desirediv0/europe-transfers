import { IconCar, IconShield, IconHeart, IconUsers } from "@tabler/icons-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">About Us</h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        The Europe Transfers is a premium travel and transfer service operating across Europe.
        We provide reliable, comfortable, and safe transportation for individuals and groups.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {[
          { icon: IconCar, title: "Premium Vehicles", desc: "Our fleet consists of well-maintained, modern vehicles suitable for all group sizes and travel needs." },
          { icon: IconShield, title: "Safety First", desc: "All our drivers are licensed, experienced, and undergo regular background checks for your peace of mind." },
          { icon: IconHeart, title: "Customer Care", desc: "We prioritize your comfort and satisfaction, offering personalized service for every journey." },
          { icon: IconUsers, title: "Expert Team", desc: "Our team of travel experts curates the best routes and experiences across Europe." },
        ].map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <item.icon className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h3 className="font-serif font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
