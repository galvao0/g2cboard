export interface Fatura {
  codigo: string;
  vencimento: string; // 'dd/mm/yyyy'
  valor: number | string;
  status: string;
  codigoBarras: string;
  codigoPix: string;
  linkFatura: string;
  dataPagamento: string | null; // 'yyyy-mm-dd' (ou null se ainda não paga)
}

export interface Devedor {
  id: string;
  cpf: string;
  nome: string;
  totalDevedor: number;
  faturas: Fatura[];
}

export type CampoOrdem = 'nome' | 'valor' | 'vencimento' | 'status';
export type Periodo = 'todos' | '1m' | '3m' | '6m' | '12m';
export type StatusFiltro = 'todos' | 'atraso' | 'dia';

export interface MesEstatistica {
  mes: number;
  rotulo: string;
  totalDevedor: number;
  totalRecebido: number;
  faturamento: number;
  totalDevedores: number;
}

export interface Metrica {
  atual: number;
  variacao: number | null;
}
