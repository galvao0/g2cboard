import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatusDevedor } from './enum/status-devedor';

export interface Fatura {
  codigo: string;
  vencimento: string;
  valor: number | string;
  status: string;
  codigoBarras: string;
  codigoPix: string;
  linkFatura: string;
}

export interface Devedor {
  id: string;
  cpf: string;
  nome: string;
  totalDevedor: number;
  faturas: Fatura[];
  status: StatusDevedor;
}

@Injectable({
  providedIn: 'root',
})
export class DevedoresService {
  private http = inject(HttpClient);

  private url = 'http://localhost:3000/devedores';

  readonly devedores = signal<Devedor[]>([]);
  readonly pAtual = signal(1);
  readonly qntdPage = 10;
  readonly devOpId = signal<string | null>(null);
  readonly devPesq = signal('');
  readonly filtro = signal<'nome' | 'v' | 'ven' | 'n' | 'st' | null>(null);
  readonly ordem = signal<'asc' | 'desc'>('asc');
  readonly p = signal<0 | 1 | 3 | 6 | 12>(1);

  get(): void {
    this.http.get<Devedor[]>(this.url).subscribe({
      next: (data) => {
        this.devedores.set(Array.from(data));
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  readonly devsFiltrado = computed(() => {
    const dev = this.devPesq()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (!dev) return this.devedores();

    return this.devedores().filter((devedor) => {
      const nome = devedor.nome
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return nome.includes(dev) || devedor.cpf.includes(dev);
    });
  });

  readonly tPage = computed(() => Math.ceil(this.devsFiltrado().length / this.qntdPage));

  ul(dev: Devedor): number | null {
    const datas = dev.faturas
      .map((f) => {
        const [dia, mes, ano] = f.vencimento.split('/').map(Number);

        return new Date(ano, mes - 1, dia).getTime();
      })
      .filter(Number.isFinite);

    return datas.length ? Math.max(...datas) : null;
  }

  readonly devDiv = computed(() => {
    const f = this.filtro();
    const ordem = this.ordem();

    const dados = [...this.devsFiltrado()];

    if (f === 'nome') {
      dados.sort((d1, d2) => d1.nome.localeCompare(d2.nome));
    }

    if (f === 'v') {
      dados.sort((d1, d2) => d1.totalDevedor - d2.totalDevedor);
    }

    if (f === 'ven') {
      dados.sort((d1, d2) => (this.ul(d1) ?? 0) - (this.ul(d2) ?? 0));
    }

    if (f === 'n') {
      dados.sort((d1, d2) => d1.faturas.length - d2.faturas.length);
    }

    if (f === 'st') {
      dados.sort((d1, d2) => d1.status.localeCompare(d2.nome));
    }

    if (ordem === 'desc') dados.reverse();

    const p = (this.pAtual() - 1) * this.qntdPage;

    return dados.slice(p, p + this.qntdPage);
  });

  readonly tDev = computed(
    () => this.devedores().filter((d) => d.status === StatusDevedor.EMATRASO).length,
  );

  readonly tDevDia = computed(
    () => this.devedores().filter((d) => d.status === StatusDevedor.EMDIA).length,
  );

  private reset() {
    this.pAtual.set(1);
    this.devOpId.set(null);
  }

  filtrar(f: 'nome' | 'v' | 'ven' | 'n') {
    if (this.filtro() === f) {
      this.ordem.update((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      this.filtro.set(f);
      this.ordem.set('asc');
    }

    this.reset();
  }

  back() {
    if (this.pAtual() > 1) {
      this.pAtual.update((p) => p - 1);
      this.devOpId.set(null);
    }
  }

  next() {
    if (this.pAtual() < this.tPage()) {
      this.pAtual.update((p) => p + 1);
      this.devOpId.set(null);
    }
  }

  exp(id: string) {
    this.devOpId.update((at) => (at === id ? null : id));
  }

  copy(code: string) {
    navigator.clipboard.writeText(code);
  }

  setDevPesq(valor: string) {
    this.devPesq.set(valor);
    this.reset();
  }

  readonly ulDevs = computed(() =>
    [...this.devedores()].sort((d1, d2) => (this.ul(d2) ?? 0) - (this.ul(d1) ?? 0)).slice(0, 3),
  );

  readonly vDev = computed(() =>
    this.devedores().reduce(
      (t, dev) =>
        t +
        dev.faturas
          .filter((f) => f.status.toLowerCase() === 'vencida')
          .reduce((t, f) => t + Number(f.valor), 0),
      0,
    ),
  );

  readonly vDia = computed(() =>
    this.devedores().reduce(
      (t, dev) =>
        t +
        dev.faturas
          .filter((f) => f.status.toLowerCase() === 'paga')
          .reduce((t, f) => t + Number(f.valor), 0),
      0,
    ),
  );

  readonly grafico = computed(() => {
    const h = new Date();
    const anoAtual = h.getFullYear();
    const mesAtual = h.getMonth();

    const meses = Array.from({ length: mesAtual + 1 }, (_, i) => ({
      nome: new Date(anoAtual, i, 1).toLocaleDateString('pt-BR', {
        month: 'short',
      }),
      mes: i,
      ano: anoAtual,
    }));

    return {
      mes: meses.map((m) => m.nome),

      rec: meses.map((m) =>
        this.devedores().reduce(
          (t, d) =>
            t +
            d.faturas
              .filter((f) => {
                const [_, mes, ano] = f.vencimento.split('/').map(Number);

                return f.status.toLowerCase() === 'paga' && mes - 1 === m.mes && ano === m.ano;
              })
              .reduce((soma, f) => soma + Number(f.valor), 0),
          0,
        ),
      ),

      dev: meses.map((m) =>
        this.devedores().reduce(
          (total, d) =>
            total +
            d.faturas
              .filter((f) => {
                const [_, mes, ano] = f.vencimento.split('/').map(Number);

                return f.status.toLowerCase() === 'vencida' && mes - 1 === m.mes && ano === m.ano;
              })
              .reduce((soma, f) => soma + Number(f.valor), 0),
          0,
        ),
      ),
    };
  });

  setP(v: 0 | 1 | 3 | 6 | 12) {
    this.p.set(v);
  }

  private redFaturas(status: string, inicio: Date, fim: Date): number {
    return this.devedores().reduce(
      (t, dev) =>
        t +
        dev.faturas
          .filter((f) => {
            const [d, m, a] = f.vencimento.split('/').map(Number);
            const data = new Date(a, m - 1, d);

            return f.status.toLowerCase() === status && data >= inicio && data < fim;
          })
          .reduce((t, f) => t + Number(f.valor), 0),
      0,
    );
  }

  readonly calc = computed(() => {
    const vp = this.p();
    const h = new Date();

    const variacao = (at: number, ant: number): number | null => {
      if (ant === 0) return at === 0 ? 0 : null;

      return ((at - ant) / ant) * 100;
    };

    if (vp === 0) {
      return {
        recebido: {
          atual: this.vDia(),
          anterior: 0,
          variacao: null,
        },
        devedor: {
          atual: this.vDev(),
          anterior: 0,
          variacao: null,
        },
      };
    }

    const inicio = new Date(h.getFullYear(), h.getMonth() - vp + 1, 1);
    const fim = new Date(h.getFullYear(), h.getMonth() + 1, 1);

    const inicioAnt = new Date(inicio.getFullYear(), inicio.getMonth() - vp, 1);
    const fimAnt = inicio;

    const res = this.redFaturas('paga', inicio, fim);
    const resAnt = this.redFaturas('paga', inicioAnt, fimAnt);
    const dev = this.redFaturas('vencida', inicio, fim);
    const devAnt = this.redFaturas('vencida', inicioAnt, fimAnt);

    return {
      recebido: {
        atual: res,
        anterior: resAnt,
        variacao: variacao(res, resAnt),
      },
      devedor: {
        atual: dev,
        anterior: devAnt,
        variacao: variacao(dev, devAnt),
      },
    };
  });
}
