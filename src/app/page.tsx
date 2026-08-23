import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  HeartPulse,
  ClipboardList,
  CalendarCheck,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-semibold text-slate-900">NephroAssist</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button>Registrieren</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-sm text-slate-600 mb-6">
            <HeartPulse className="mr-2 h-4 w-4 text-blue-600" />
            Die Plattform für Transplantationskoordination
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Ihr Weg zur{" "}
            <span className="text-blue-600">Transplantation</span>
            <br />
            – digital unterstützt
          </h1>
          <p className="mt-6 text-lg text-slate-600 md:text-xl">
            NephroAssist begleitet Patienten, Dialysezentren und Transplantationszentren
            durch den komplexen organisatorischen Prozess der Organtransplantation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Jetzt starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Mehr erfahren
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-4 max-w-4xl mx-auto">
          {[
            { value: "500+", label: "Patienten" },
            { value: "95%", label: "Termintreue" },
            { value: "50%", label: "Weniger Papierkram" },
            { value: "24/7", label: "Zugriff" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Für wen ist NephroAssist?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Eine Plattform – drei Zielgruppen
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              icon: Users,
              title: "Für Patienten",
              description:
                "Behalten Sie den Überblick über Ihre Anforderungen, Termine und nächsten Schritte auf dem Weg zur Transplantation.",
              features: ["Aufgaben-Checkliste", "Terminerinnerungen", "Dokumenten-Upload"],
            },
            {
              icon: HeartPulse,
              title: "Für Kliniken",
              description:
                "Verwalten Sie Patienten, Anforderungen und Dokumentenprüfungen effizient in einer zentralen Plattform.",
              features: ["Patienten-Übersicht", "Automatische Workflows", "Prüfungs-Tracking"],
            },
            {
              icon: ClipboardList,
              title: "Für Dialysezentren",
              description:
                "Unterstützen Sie Ihre Patienten bei der Vorbereitung auf die Transplantation mit strukturierten Prozessen.",
              features: ["Patienten-Begleitung", "Dokumenten-Austausch", "Kommunikation"],
            },
          ].map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Wie es funktioniert
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Registrierung", text: "Konto erstellen und Patientendaten erfassen" },
            { step: "2", title: "Anforderungen", text: "Personalisierte Checkliste mit allen notwendigen Untersuchungen" },
            { step: "3", title: "Termine", text: "Automatische Koordination mit Ärzten und Kliniken" },
            { step: "4", title: "Transplantation", text: "Optimal vorbereitet auf die Operation warten" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-blue-600 text-white">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Bereit für einen einfacheren Weg?
            </h2>
            <p className="mb-6 text-blue-100">
              Starten Sie noch heute mit NephroAssist und vereinfachen Sie die organisatorische Seite der Transplantation.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Kostenlos registrieren
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-blue-600" />
              <span className="font-semibold text-slate-900">NephroAssist</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="#" className="hover:text-slate-900">Datenschutz</Link>
              <Link href="#" className="hover:text-slate-900">Impressum</Link>
              <Link href="#" className="hover:text-slate-900">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
