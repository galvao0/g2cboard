import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CampoOrdem,
  Devedor,
  Fatura,
  MesEstatistica,
  Metrica,
  Periodo,
  StatusFiltro,
} from '../../models/devedor';

const ROTULOS_MES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const MESES_POR_PERIODO: Record<Periodo, number | null> = {
  todos: null,
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '12m': 12,
};

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const parseData = (d: string) => {
  const [dia, mes, ano] = d.split('/').map(Number);
  return new Date(ano, mes - 1, dia).getTime();
};

const idxBR = (d: string) => {
  const [, mes, ano] = d.split('/').map(Number);
  return ano * 12 + (mes - 1);
};
const idxISO = (d: string) => {
  const [ano, mes] = d.slice(0, 10).split('-').map(Number);
  return ano * 12 + (mes - 1);
};

@Injectable({ providedIn: 'root' })
export class DevedoresService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/devedores';

  readonly devedores = signal<Devedor[]>([]);
  readonly carregando = signal(false);
  readonly busca = signal('');
  readonly ordem = signal<{ campo: CampoOrdem; dir: 'asc' | 'desc' }>({
    campo: 'vencimento',
    dir: 'desc',
  });
  readonly paginaAtual = signal(1);
  readonly itensPagina = 10;
  readonly devedorAbertoId = signal<string | null>(null);

  readonly periodo = signal<Periodo>('todos');
  readonly statusFiltro = signal<StatusFiltro>('todos');

  readonly opcoesPeriodo = [
    { valor: 'todos', rotulo: 'Todo o período' },
    { valor: '1m', rotulo: 'Este mês' },
    { valor: '3m', rotulo: 'Últimos 3 meses' },
    { valor: '6m', rotulo: 'Últimos 6 meses' },
    { valor: '12m', rotulo: 'Últimos 12 meses' },
  ];

  readonly opcoesStatus = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'atraso', rotulo: 'Em atraso' },
    { valor: 'dia', rotulo: 'Em dia' },
  ];

  private readonly anoAtual = new Date().getFullYear();
  private readonly mesAtual = new Date().getMonth(); // 0..11
  private readonly idxHoje = this.anoAtual * 12 + this.mesAtual;

  carregar(): void {
    this.carregando.set(true);
    this.http.get<Devedor[]>(this.url).subscribe({
      next: (data) => {
        this.devedores.set(Array.from(data));
        this.carregando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.carregando.set(false);
      },
    });
  }

  private readonly primeiroIdx = computed(() => {
    let min = this.idxHoje;
    for (const d of this.devedores())
      for (const f of d.faturas) {
        min = Math.min(min, idxBR(f.vencimento));
        if (f.dataPagamento) min = Math.min(min, idxISO(f.dataPagamento));
      }
    return min;
  });

  readonly janela = computed(() => {
    const n = MESES_POR_PERIODO[this.periodo()];
    const fim = this.idxHoje;
    const ini = n ? fim - n + 1 : this.primeiroIdx();
    const ant = n ? { ini: ini - n, fim: ini - 1 } : null;
    return { ini, fim, ant };
  });

  readonly rotuloComparacao = computed(() => {
    const p = this.periodo();
    if (p === 'todos') return 'sem comparação';
    return p === '1m' ? 'vs. mês anterior' : 'vs. período anterior';
  });

  private calcMes(idx: number): MesEstatistica {
    let faturamento = 0;
    let recebido = 0;
    let emAberto = 0;
    const cpfs = new Set<string>();

    for (const d of this.devedores()) {
      for (const f of d.faturas) {
        const valor = Number(f.valor);
        const venc = idxBR(f.vencimento);
        const paga = f.status === 'paga';
        const pago = f.dataPagamento ? idxISO(f.dataPagamento) : null;

        if (venc === idx) faturamento += valor;
        if (pago === idx) recebido += valor;

        const abertoNoMes = venc <= idx && (paga ? pago !== null && pago > idx : true);
        if (abertoNoMes) {
          emAberto += valor;
          cpfs.add(d.cpf);
        }
      }
    }

    return {
      mes: (idx % 12) + 1,
      rotulo: `${ROTULOS_MES[idx % 12]}/${String(Math.floor(idx / 12)).slice(2)}`,
      faturamento,
      totalRecebido: recebido,
      totalDevedor: emAberto,
      totalDevedores: cpfs.size,
    };
  }

  readonly meses = computed<MesEstatistica[]>(() => {
    const j = this.janela();
    const n = Math.min(24, Math.max(3, j.fim - j.ini + 1));
    return Array.from({ length: n }, (_, i) => this.calcMes(j.fim - n + 1 + i));
  });

  readonly resumo = computed(() => {
    if (!this.devedores().length) return null;
    const j = this.janela();

    const fluxo = (ini: number, fim: number) => {
      let fat = 0;
      let rec = 0;
      for (let i = ini; i <= fim; i++) {
        const m = this.calcMes(i);
        fat += m.faturamento;
        rec += m.totalRecebido;
      }
      return { fat, rec };
    };

    const atualF = fluxo(j.ini, j.fim);
    const antF = j.ant ? fluxo(j.ant.ini, j.ant.fim) : null;
    const saldoAtual = this.calcMes(j.fim);
    const saldoAnt = j.ant ? this.calcMes(j.ant.fim) : null;

    const m = (atual: number, anterior: number | null | undefined): Metrica => ({
      atual,
      variacao: anterior != null && anterior > 0 ? ((atual - anterior) / anterior) * 100 : null,
    });

    return {
      faturamento: m(atualF.fat, antF?.fat),
      totalRecebido: m(atualF.rec, antF?.rec),
      totalDevedor: m(saldoAtual.totalDevedor, saldoAnt?.totalDevedor),
      totalDevedores: m(saldoAtual.totalDevedores, saldoAnt?.totalDevedores),
    };
  });

  readonly resumoPeriodo = computed(() => {
    const j = this.janela();
    let recebido = 0;
    let aberto = 0;
    for (const d of this.devedores())
      for (const f of d.faturas) {
        const i = idxBR(f.vencimento);
        if (i < j.ini || i > j.fim) continue;
        if (f.status === 'paga') recebido += Number(f.valor);
        else aberto += Number(f.valor);
      }
    const total = recebido + aberto;
    return {
      recebido,
      aberto,
      pctRecebido: total > 0 ? (recebido / total) * 100 : 0,
      pctAberto: total > 0 ? (aberto / total) * 100 : 0,
    };
  });

  ultimoVencimento(d: Devedor): string {
    return d.faturas.reduce(
      (a: string, f: Fatura) => (parseData(f.vencimento) > parseData(a) ? f.vencimento : a),
      d.faturas[0].vencimento,
    );
  }

  checkStatusDevedor(faturas: { status: string }[]): 'Em Dia' | 'Em Atraso' {
    return faturas.every((f) => f.status === 'paga') ? 'Em Dia' : 'Em Atraso';
  }

  toMoney(v: number | string): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));
  }

  toPercent(v: number): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v) + '%';
  }

  fmtVar(v: number | null | undefined): string {
    if (v == null) return '—';
    return (v > 0 ? '+' : '') + this.toPercent(v);
  }

  bom(v: number | null | undefined, invertido = false): boolean | null {
    if (v == null) return null;
    return invertido ? v <= 0 : v >= 0;
  }

  classeVar(v: number | null | undefined, invertido = false): string {
    const b = this.bom(v, invertido);
    return b === null ? '' : b ? 'positivo' : 'negativo';
  }

  readonly ultimosDevedores = computed(() =>
    [...this.devedores()]
      .filter((d) => d.faturas.length)
      .sort((a, b) => parseData(this.ultimoVencimento(b)) - parseData(this.ultimoVencimento(a)))
      .slice(0, 3),
  );

  readonly devedoresFiltrados = computed(() => {
    const termo = normalizar(this.busca());
    const termoCpf = termo.replace(/\D/g, '');
    const j = this.janela();
    const st = this.statusFiltro();

    let lista = this.devedores().filter((d) => d.faturas.length);

    lista = lista.filter((d) =>
      d.faturas.some((f) => {
        const i = idxBR(f.vencimento);
        return i >= j.ini && i <= j.fim;
      }),
    );

    if (st !== 'todos') {
      lista = lista.filter(
        (d) => (this.checkStatusDevedor(d.faturas) === 'Em Dia') === (st === 'dia'),
      );
    }

    if (termo) {
      lista = lista.filter(
        (d) =>
          normalizar(d.nome).includes(termo) ||
          (termoCpf && d.cpf.replace(/\D/g, '').includes(termoCpf)),
      );
    }

    const { campo, dir } = this.ordem();
    const fator = dir === 'asc' ? 1 : -1;

    return [...lista].sort((a, b) => {
      switch (campo) {
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR') * fator;
        case 'valor':
          return (Number(a.totalDevedor) - Number(b.totalDevedor)) * fator;
        case 'vencimento':
          return (
            (parseData(this.ultimoVencimento(a)) - parseData(this.ultimoVencimento(b))) * fator
          );
        case 'status':
          return (
            this.checkStatusDevedor(a.faturas).localeCompare(this.checkStatusDevedor(b.faturas)) *
            fator
          );
        default:
          return 0;
      }
    });
  });

  readonly totalPaginas = computed(() =>
    Math.ceil(this.devedoresFiltrados().length / this.itensPagina),
  );

  readonly devedoresPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPagina;
    return this.devedoresFiltrados().slice(inicio, inicio + this.itensPagina);
  });

  private resetarLista() {
    this.paginaAtual.set(1);
    this.devedorAbertoId.set(null);
  }

  setBusca(valor: string) {
    this.busca.set(valor);
    this.resetarLista();
  }

  setPeriodo(valor: string) {
    this.periodo.set(valor as Periodo);
    this.resetarLista();
  }

  setStatus(valor: string) {
    this.statusFiltro.set(valor as StatusFiltro);
    this.resetarLista();
  }

  ordenarPor(campo: CampoOrdem) {
    const atual = this.ordem();
    this.ordem.set(
      atual.campo === campo
        ? { campo, dir: atual.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: campo === 'nome' || campo === 'status' ? 'asc' : 'desc' },
    );
    this.resetarLista();
  }

  paginaAnterior() {
    if (this.paginaAtual() > 1) {
      this.paginaAtual.update((p) => p - 1);
      this.devedorAbertoId.set(null);
    }
  }

  proximaPagina() {
    if (this.paginaAtual() < this.totalPaginas()) {
      this.paginaAtual.update((p) => p + 1);
      this.devedorAbertoId.set(null);
    }
  }

  toggleDetalhes(id: string) {
    this.devedorAbertoId.update((atual) => (atual === id ? null : id));
  }

  copy(code: string) {
    navigator.clipboard.writeText(code);
  }
}
