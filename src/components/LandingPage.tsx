import { Bot, Sparkles, Search, MessageSquareText, BookOpen, GraduationCap, Play, ArrowRight, ChevronDown, Menu, X, Brain, Library, Globe, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: (page: 'auth' | 'register') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<'esami' | 'orari' | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#003366] to-[#004080] rounded-lg flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">UniSearch</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo('features')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#003366] dark:hover:text-blue-400 transition-colors">Funzionalità</button>
              <button onClick={() => scrollTo('demo')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#003366] dark:hover:text-blue-400 transition-colors">Demo</button>
              <button onClick={() => scrollTo('how')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#003366] dark:hover:text-blue-400 transition-colors">Come Funziona</button>
              <div className="flex items-center gap-3 ml-4">
                <button onClick={() => onNavigate('auth')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#003366] dark:hover:text-blue-400 transition-colors px-4 py-2">Accedi</button>
                <button onClick={() => onNavigate('register')} className="text-sm font-medium bg-[#003366] hover:bg-[#004080] text-white px-5 py-2 rounded-lg transition-all shadow-md hover:shadow-lg">Registrati</button>
              </div>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-400">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollTo('features')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-[#003366] py-2">Funzionalità</button>
              <button onClick={() => scrollTo('demo')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-[#003366] py-2">Demo</button>
              <button onClick={() => scrollTo('how')} className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-[#003366] py-2">Come Funziona</button>
              <div className="pt-2 space-y-2 border-t border-gray-200 dark:border-gray-800">
                <button onClick={() => onNavigate('auth')} className="block w-full text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg py-2.5">Accedi</button>
                <button onClick={() => onNavigate('register')} className="block w-full text-center text-sm font-medium text-white bg-[#003366] hover:bg-[#004080] rounded-lg py-2.5">Registrati</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366]/5 dark:bg-[#003366]/10 rounded-full text-sm text-[#003366] dark:text-blue-300 font-medium">
              <Sparkles className="w-4 h-4" />
              AI per l'Università
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Il tuo assistente universitario{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003366] to-[#2563eb]">intelligente</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              Cerca tra migliaia di documenti, programmi dei corsi e appelli d'esame con l'aiuto dell'intelligenza artificiale. Risposte precise, fonti verificate.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('register')} className="inline-flex items-center gap-2 bg-[#003366] hover:bg-[#004080] text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-medium">
                Inizia Gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo('demo')} className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:border-[#003366] dark:hover:border-blue-400 transition-colors font-medium">
                <Play className="w-4 h-4" /> Guarda la Demo
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#003366]/10 to-[#2563eb]/5 dark:from-[#003366]/20 dark:to-[#2563eb]/10 rounded-3xl blur-2xl" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 max-w-md">
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-400 border border-gray-200 dark:border-gray-700">unisearch.ai</div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#003366] to-[#004080] rounded-lg flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Ciao! Sono UniSearch, il tuo assistente universitario. Cosa vuoi cercare oggi?</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl rounded-tl-none px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Quali sono gli appelli d'esame di Analisi 1 per il mese di giugno?</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 opacity-0 animate-in" style={{ animationDelay: '2s' }}>
                  <div className="w-8 h-8 bg-gradient-to-br from-[#003366] to-[#004080] rounded-lg flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <button onClick={() => scrollTo('features')} className="text-gray-400 hover:text-[#003366] dark:hover:text-blue-400 transition-colors animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Tutto quello che ti serve per l'università</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Un unico posto per trovare informazioni su corsi, esami e molto altro.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Search, title: 'Cerca in tutti i documenti', desc: 'Cerca nei programmi dei corsi, slide, dispense e materiale didattico. Trova quello che ti serve in pochi secondi.' },
              { icon: BookOpen, title: 'Appelli d\'esame', desc: 'Consulta le date degli appelli, i programmi dettagliati e le modalità d\'esame per ogni corso.' },
              { icon: Library, title: 'Orario lezioni', desc: 'Verifica l\'orario delle lezioni, le aule e i docenti per ogni corso di laurea.' },
              { icon: Brain, title: 'Risposte intelligenti', desc: 'L\'AI analizza i documenti e ti dà risposte precise con le fonti da cui sono tratte.' },
              { icon: Globe, title: 'Tutte le università', desc: 'Supporto per qualsiasi università italiana. Dai Unimi alla tua, Unisearch funziona ovunque.' },
              { icon: Star, title: 'Gratuito per gli studenti', desc: 'Registrati con la tua email universitaria e inizia subito. Nessun costo, nessun impegno.' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#003366]/30 dark:hover:border-blue-500/30 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-[#003366]/5 dark:bg-[#003366]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#003366] dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Placeholder */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Vedi UniSearch in azione</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Guarda come risponde alle domande sugli esami, trova orari e molto altro.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group cursor-pointer" onClick={() => setPlayingVideo(playingVideo === 'esami' ? null : 'esami')}>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#003366]/20 to-[#2563eb]/10 dark:from-[#003366]/30 dark:to-[#2563eb]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-800 overflow-hidden">
                {playingVideo === 'esami' ? (
                  <video className="w-full h-full object-contain" controls autoPlay src="/videos/demo_spanish.mov" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDMzNjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-[#003366]/10 dark:bg-[#003366]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-[#003366] dark:text-blue-400 ml-0.5" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Demo: Ricerca Esami</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Clicca per vedere il video</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="relative group cursor-pointer" onClick={() => setPlayingVideo(playingVideo === 'orari' ? null : 'orari')}>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#003366]/20 to-[#2563eb]/10 dark:from-[#003366]/30 dark:to-[#2563eb]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-800 overflow-hidden">
                {playingVideo === 'orari' ? (
                  <video className="w-full h-full object-contain" controls autoPlay src="/videos/Demo_UniSearch.mov" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDMzNjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-[#003366]/10 dark:bg-[#003366]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-[#003366] dark:text-blue-400 ml-0.5" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Demo: Orario Lezioni</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Clicca per vedere il video</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Come funziona</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">In tre semplici passaggi ottieni le risposte che cerchi.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#003366]/20 via-[#2563eb]/20 to-[#003366]/20 -translate-y-1/2" />

            {[
              { step: '1', icon: MessageSquareText, title: 'Fai una domanda', desc: 'Chiedi qualsiasi cosa sui tuoi corsi, esami o orari. In linguaggio naturale, come parleresti con un amico.' },
              { step: '2', icon: Search, title: 'L\'AI cerca nei documenti', desc: 'Unisearch analizza tutti i documenti, programmi e database per trovare le informazioni più pertinenti.' },
              { step: '3', icon: Bot, title: 'Ricevi la risposta', desc: 'Ottieni una risposta chiara e precisa, con le fonti da cui è stata tratta. Sempre verificabile.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-8">
                <div className="w-14 h-14 bg-[#003366] dark:bg-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#003366]/20 relative z-10">
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <div className="w-12 h-12 bg-[#003366]/5 dark:bg-[#003366]/10 rounded-xl flex items-center justify-center mx-auto mb-4 -mt-3">
                  <item.icon className="w-6 h-6 text-[#003366] dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 p-8 rounded-2xl bg-gradient-to-br from-[#003366]/5 to-[#2563eb]/5 dark:from-[#003366]/10 dark:to-[#2563eb]/5 border border-[#003366]/10 dark:border-[#003366]/20">
            {[
              { value: '10K+', label: 'Documenti indicizzati' },
              { value: '50+', label: 'Corsi di Laurea' },
              { value: '100%', label: 'Gratuito' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#003366] dark:text-blue-400">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Pronto a semplificare la tua vita universitaria?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Registrati subito, ci vogliono solo pochi secondi.</p>
          <button onClick={() => onNavigate('register')} className="inline-flex items-center gap-2 bg-[#003366] hover:bg-[#004080] text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl font-medium text-lg">
            Crea il tuo account gratis <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Bot className="w-4 h-4" />
            UniSearch
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <button className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors">Termini di Servizio</button>
            <button className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors">Cookie Policy</button>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} UniSearch. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}
