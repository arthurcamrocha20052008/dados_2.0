import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const kpis = [
    {
      label: 'Receita Líquida Auditada',
      value: 'R$ 1.482.900,00',
      delta: '+18,4% vs mês anterior',
      color: 'text-emerald-400',
    },
    {
      label: 'Dashboards Automatizados Ativos',
      value: '24 Painéis',
      delta: 'Sincronização em tempo real',
      color: 'text-indigo-400',
    },
    {
      label: 'Registros Higienizados (ETL)',
      value: '148.320 linhas',
      delta: '99,98% de integridade',
      color: 'text-cyan-400',
    },
    {
      label: 'Ticket Médio Corporativo',
      value: 'R$ 6.420,50',
      delta: '+5,2% de crescimento',
      color: 'text-amber-400',
    },
  ]

  const barSeries = [
    { regiao: 'Sudeste', valor: 92, montante: 'R$ 680.400' },
    { regiao: 'Sul', valor: 74, montante: 'R$ 410.200' },
    { regiao: 'Nordeste', valor: 58, montante: 'R$ 245.800' },
    { regiao: 'Centro-Oeste', valor: 41, montante: 'R$ 146.500' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Topbar Corporativa */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-xs text-white">
              DA
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white">
                Dashboards Automatizados
              </span>
              <span className="ml-2.5 text-[11px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                https://app.dashboardmagico.com
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition"
              >
                Encerrar Sessão
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Central de Dashboards Automatizados
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Monitoramento executivo, limpeza automática de planilhas (ETL) e métricas em tempo real.
            </p>
          </div>
          <a
            href="https://app.dashboardmagico.com"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/20"
          >
            + Novo Upload de Planilha (.xlsx / .csv)
          </a>
        </div>

        {/* Grid de KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5 shadow-sm"
            >
              <p className="text-xs font-medium text-zinc-400">{item.label}</p>
              <h3 className={`text-2xl font-bold mt-2 tracking-tight ${item.color}`}>
                {item.value}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1.5">{item.delta}</p>
            </div>
          ))}
        </section>

        {/* Seção de Gráficos Executivos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Desempenho por Região */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Performance Regional — Dashboards Automatizados
                </h2>
                <p className="text-xs text-zinc-400">
                  Consolidado automático pós-higienização de planilhas
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                Atualizado agora
              </span>
            </div>

            <div className="space-y-4">
              {barSeries.map((row) => (
                <div key={row.regiao} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">{row.regiao}</span>
                    <span className="text-zinc-400">{row.montante}</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                      style={{ width: `${row.valor}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Auditoria do Motor de Limpeza */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 mb-1">
                Status do Robô de Auto-Limpeza (ETL)
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                Últimas correções automáticas aplicadas nas planilhas importadas
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Conversão automática de strings monetárias (R$) para ponto flutuante
                </li>
                <li className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Remoção de células com fórmulas corrompidas (#DIV/0!, #VALOR!, #REF!)
                </li>
                <li className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Deduplicação de registros e padronização de datas (DD/MM/AAAA)
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Domínio de Produção Seguro (TLS/HTTPS)</span>
              <span className="text-indigo-400 font-medium">app.dashboardmagico.com</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
