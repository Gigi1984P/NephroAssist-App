import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-semibold text-slate-900">NephroAssist</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Anmelden
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Ihr Weg zur Transplantation
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            NephroAssist begleitet Sie organisatorisch auf dem Weg zur Organtransplantation. 
            Wir koordinieren Anforderungen, Termine und Dokumente zwischen Patienten, 
            Dialysezentren und Transplantationszentren.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Jetzt starten
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Für Patienten</h3>
            <p className="mt-2 text-sm text-slate-600">
              Behalten Sie den Überblick über Ihre Anforderungen, Termine und nächsten Schritte.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Für Kliniken</h3>
            <p className="mt-2 text-sm text-slate-600">
              Verwalten Sie Patienten, Anforderungen und Dokumentenprüfungen effizient.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Für Dialysezentren</h3>
            <p className="mt-2 text-sm text-slate-600">
              Unterstützen Sie Ihre Patienten bei der Vorbereitung auf die Transplantation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
