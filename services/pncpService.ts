
import { PNCPResponse, FilterParams, PNCPContratacao, PNCPContrato, PNCPItemResultado, PNCPArquivo, PNCPTermoContrato, EmpresaInfo } from '../types';
import { formatApiDate, cleanCnpj } from '../utils/formatters';

const IS_DEV = import.meta.env.DEV;
const EMPRESA_KEY = 'b7650fe8bd086f1d7c0d978f82e7e066594379d1';

// Em desenvolvimento usa o proxy do Vite; em produção usa proxy.php
const pncpUrl  = (path: string, qs = '') =>
  IS_DEV
    ? `/proxy/pncp/${path}${qs ? '?' + qs : ''}`
    : `/proxy.php?service=pncp&path=${encodeURIComponent('/' + path)}${qs ? '&' + qs : ''}`;

const empresaUrl = (cnpj: string) =>
  IS_DEV
    ? `/proxy/empresaqui/api/${EMPRESA_KEY}/${cnpj}`
    : `/proxy.php?service=empresa&path=${encodeURIComponent('/api/' + EMPRESA_KEY + '/' + cnpj)}`;

const API_BASE          = IS_DEV ? '/proxy/pncp/api/pncp/v1'      : null;
const PNCP_CONSULTA_BASE = IS_DEV ? '/proxy/pncp/api/consulta/v1' : null;

const handlePncpFetch = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Recurso não encontrado no servidor do PNCP.");
    }
    throw new Error(`Erro ${response.status}: Falha na comunicação com o PNCP.`);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error("Resposta do servidor em formato inválido.");
  }
};

export const fetchContratos = async (params: FilterParams): Promise<PNCPResponse<PNCPContrato>> => {
  const { dataInicial, dataFinal, pagina, cnpj } = params;
  const query = new URLSearchParams({
    dataInicial: formatApiDate(dataInicial),
    dataFinal: formatApiDate(dataFinal),
    pagina: pagina.toString()
  });

  // Se houver CNPJ, filtra pelo Fornecedor (niFornecedor)
  if (cnpj) {
    query.append('niFornecedor', cleanCnpj(cnpj));
  }

  const result = await handlePncpFetch(pncpUrl('api/consulta/v1/contratos', query.toString()));
  return {
    data: result.data || [],
    totalPaginas: result.totalPaginas || 0,
    totalRegistros: result.totalRegistros || 0,
    numeroPagina: result.numeroPagina || pagina
  };
};

export const fetchArquivosContrato = async (params: FilterParams): Promise<PNCPResponse<PNCPArquivo>> => {
  const { cnpj, ano, sequencial } = params;
  if (!cnpj || !ano || !sequencial) throw new Error("Parâmetros de busca são obrigatórios.");

  const safeCnpj = cleanCnpj(cnpj);
  const result = await handlePncpFetch(pncpUrl(`api/pncp/v1/orgaos/${safeCnpj}/contratos/${ano}/${sequencial}/arquivos`));
  const data = Array.isArray(result) ? result : (result.data || []);
  return { data, totalPaginas: 1, totalRegistros: data.length, numeroPagina: 1 };
};

export const fetchEmpresaInfo = async (cnpj: string): Promise<EmpresaInfo> => {
  const safeCnpj = cleanCnpj(cnpj);
  const response = await fetch(empresaUrl(safeCnpj), {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) throw new Error(`CNPJ ${safeCnpj} não encontrado (${response.status}).`);

  const result = await response.json();
  if (!result || result.Erro) throw new Error(result.Erro || 'Empresa não encontrada.');

  return Array.isArray(result) ? result[0] : result;
};

export const downloadArquivoPncp = async (
  cnpj: string, 
  ano: string, 
  sequencial: string, 
  sequencialDocumento: number, 
  nomeArquivoSugerido: string,
  urlOriginal?: string
) => {
  const safeCnpj = cleanCnpj(cnpj);
  const target = pncpUrl(`api/pncp/v1/orgaos/${safeCnpj}/contratos/${ano}/${sequencial}/arquivos/${sequencialDocumento}`);

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: { 'Accept': '*/*' }
    });

    if (!response.ok) {
      if (urlOriginal) {
        window.open(urlOriginal, '_blank');
        return;
      }
      throw new Error('O arquivo não pôde ser localizado no repositório do PNCP.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    let fileName = nomeArquivoSugerido.trim();
    if (!fileName.includes('.')) fileName += '.pdf';
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error: any) {
    if (urlOriginal) {
      window.open(urlOriginal, '_blank');
      return;
    }
    throw new Error(error.message || 'Falha ao baixar arquivo.');
  }
};
