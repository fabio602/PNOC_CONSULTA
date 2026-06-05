
export interface PNCPContratacao {
  dataAtualizacao: string;
  modalidadeNome: string;
  modoDisputaNome: string;
  situacaoCompraNome: string;
  tipoInstrumentoConvocatorioNome: string;
  valorTotalEstimado: number;
  usuarioNome: string;
  numeroControlePNCP: string;
  orgaoEntidade: {
    razaoSocial: string;
    cnpj: string;
  };
}

export interface PNCPContrato {
  numeroControlePNCP: string;
  dataAssinatura: string;
  dataVigenciaInicio: string;
  dataVigenciaFim: string;
  niFornecedor: string;
  nomeRazaoSocialFornecedor: string;
  numeroContratoEmpenho: string;
  objetoContrato: string;
  valorGlobal: number;
  usuarioNome: string;
  orgaoEntidade: {
    razaoSocial: string;
    cnpj: string;
  };
}

export interface PNCPTermoContrato {
  numeroControlePNCP: string;
  sequencialTermoContrato: number;
  tipoTermoContratoId: number;
  tipoTermoContratoNome?: string;
  numeroTermoContrato: string;
  objetoTermoContrato: string;
  dataAssinatura: string;
  dataVigenciaInicio: string;
  dataVigenciaFim: string;
  valorAcrescido: number;
  valorGlobal: number;
  niFornecedor: string;
  nomeRazaoSocialFornecedor: string;
  qualificacaoAcrescimoSupressao: boolean;
  qualificacaoVigencia: boolean;
  qualificacaoFornecedor: boolean;
  qualificacaoReajuste: boolean;
  qualificacaoInformativo: boolean;
}

export interface PNCPItemResultado {
  sequencialResultado: number;
  tipoResultadoNome: string;
  niFornecedor: string;
  nomeRazaoSocialFornecedor: string;
  quantidadeHomologada: number;
  valorUnitarioHomologado: number;
  valorTotalHomologado: number;
  dataHomologacao: string;
  situacaoItemNome: string;
}

export interface PNCPArquivo {
  sequencialDocumento: number;
  tipoDocumentoId: number;
  tipoDocumentoNome: string;
  titulo: string;
  nomeArquivo: string;
  dataPublicacaoPncp: string;
  url: string;
}

export interface AIEvaluation {
  score: number;
  classificacao: 'OURO' | 'PRATA' | 'BRONZE' | 'BAIXO';
  justificativa: string;
  probabilidadeGarantia: number;
}

export interface EmpresaInfo {
  cnpj: string;
  razao: string;
  fantasia: string;
  ddd_1: string | null;
  tel_1: string | null;
  ddd_2: string | null;
  tel_2: string | null;
  email: string;
  site: string;
  cnae_principal: string;
  cnae_secundario: string;
  log_tipo: string;
  log_nome: string;
  log_num: string;
  log_comp: string;
  log_bairro: string;
  log_municipio: string;
  log_uf: string;
  log_cep: string;
  matriz: string;
  situacao_cadastral: string;
  data_sit_cad: string;
  natureza_juridica: string;
  data_abertura: string;
  opcao_mei: string;
  porte: string;
  capital_social: string | number;
  regime_tributario: string;
  faturamento: string;
  quadro_funcionarios: string;
  // Campos de IA (opcionais)
  aiEvaluation?: AIEvaluation;
  objetoOrigem?: string;
  valorOrigem?: number;
}

export interface PNCPResponse<T> {
  data: T[];
  totalPaginas: number;
  totalRegistros: number;
  numeroPagina: number;
}

export interface FilterParams {
  dataInicial: string;
  dataFinal: string;
  codigoModalidadeContratacao?: string;
  pagina: number;
  tamanhoPagina: number;
  valorMinimo?: number;
  cnpj?: string;
  ano?: string;
  sequencial?: string;
  item?: string;
}
