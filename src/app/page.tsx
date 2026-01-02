import Link from 'next/link'
import { 
  ArrowRight, 
  Rocket, 
  GitBranch, 
  Users, 
  BarChart3,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Rocket,
    title: 'Gerenciamento de Deploys',
    description: 'Acompanhe todos os seus deployments em tempo real, com histórico completo e notificações.',
  },
  {
    icon: GitBranch,
    title: 'Integração Git',
    description: 'Conecte seus repositórios do GitHub, GitLab ou Bitbucket e visualize commits e branches.',
  },
  {
    icon: Users,
    title: 'Colaboração em Equipe',
    description: 'Convide membros, defina permissões e trabalhe em conjunto nos seus projetos.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Detalhados',
    description: 'Métricas e insights sobre seus projetos, deploys e atividade da equipe.',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Controle de acesso granular e criptografia de ponta a ponta dos seus dados.',
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Interface rápida e responsiva, otimizada para produtividade máxima.',
  },
]

const benefits = [
  'Centralize todos os seus projetos em um só lugar',
  'Acompanhe deployments em tempo real',
  'Colabore com sua equipe de forma eficiente',
  'Tenha insights valiosos com analytics',
  'Documentação e notas integradas',
  'Interface moderna e intuitiva',
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DT</span>
            </div>
            <span className="font-semibold text-xl">DizerTech</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button>
                Começar grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
            <Zap className="h-4 w-4" />
            Gerencie seus projetos com eficiência
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Sua central de{' '}
            <span className="text-primary">gerenciamento de projetos</span>{' '}
            e deployments
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Organize seus projetos, acompanhe deployments, colabore com sua equipe 
            e tenha insights valiosos sobre seu trabalho. Tudo em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Começar gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Já tenho conta
              </Button>
            </Link>
          </div>
          
          {/* Preview Image Placeholder */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-32 bottom-0 top-auto" />
            <div className="rounded-xl border shadow-2xl overflow-hidden bg-card">
              <div className="h-8 bg-muted/50 flex items-center gap-2 px-4 border-b">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <div className="text-center">
                  <Rocket className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Preview do Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para gerenciar seus projetos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades poderosas para você e sua equipe serem mais produtivos
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que escolher o DizerTech?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolvido por desenvolvedores para desenvolvedores. 
                Entendemos suas necessidades e criamos a ferramenta perfeita.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg">
                    Experimente agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-8">
              <div className="space-y-6">
                {[
                  { label: 'Projetos criados', value: '10,000+' },
                  { label: 'Deployments realizados', value: '500,000+' },
                  { label: 'Equipes ativas', value: '2,500+' },
                  { label: 'Uptime', value: '99.9%' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-4 border-b last:border-0">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a gerenciar seus projetos 
            de forma mais eficiente hoje mesmo.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DT</span>
              </div>
              <span className="font-semibold">DizerTech</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DizerTech. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
