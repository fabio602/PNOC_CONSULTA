
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterParams, PNCPResponse, PNCPContrato, PNCPArquivo, EmpresaInfo } from './types';
import { fetchContratos, fetchArquivosContrato, fetchEmpresaInfo } from './services/pncpService';
import { analyzeLeadsWithAI } from './services/aiService';
import ContractTable from './components/ContractTable';
import DocumentListTable from './components/DocumentListTable';
import CompanyListTable from './components/CompanyListTable';
import Pagination from './components/Pagination';
import { formatDateBRL, cleanCnpj } from './utils/formatters';
import * as XLSX from 'xlsx';

type ViewType = 'contratos' | 'arquivos' | 'empresa_info';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const FGLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L15 20V50C15 72.1 30 92.2 50 98C70 92.2 85 72.1 85 50V20L50 5Z" stroke="#e1c1a4" strokeWidth="3" />
    <path d="M50 10L20 23V50C20 68.6 32.7 85.5 50 90.5C67.3 85.5 80 68.6 80 50V23L50 10Z" stroke="#e1c1a4" strokeWidth="1" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#e1c1a4" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'serif' }}>FG</text>
  </svg>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('contratos');
  const [selectedContractOrgao, setSelectedContractOrgao] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const getToday = () => new Date().toISOString().split('T')[0];
  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState<FilterParams>({
    dataInicial: getYesterday(),
    dataFinal: getToday(),
    pagina: 1,
    tamanhoPagina: 20,
    valorMinimo: 0,
    cnpj: '',
    ano: new Date().getFullYear().toString(),
    sequencial: '',
  });

  const [resultsContratos, setResultsContratos] = useState<PNCPResponse<PNCPContrato> | null>(null);
  const [resultsArquivos, setResultsArquivos] = useState<PNCPResponse<PNCPArquivo> | null>(null);
  const [resultsEmpresaList, setResultsEmpresaList] = useState<EmpresaInfo[]>([]);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else if (process.env.API_KEY || process.env.GEMINI_API_KEY) {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleConfigKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      setError("Seletor de chave não disponível. Verifique se o process.env.API_KEY está configurado no seu ambiente de hospedagem.");
    }
  };

  const runAIAnalysis = async () => {
    if (!hasApiKey && window.aistudio) {
      await handleConfigKey();
    }

    if (resultsEmpresaList.length === 0) return;

    setAiLoading(true);
    setError(null);
    try {
      const evaluations = await analyzeLeadsWithAI(resultsEmpresaList);
      setResultsEmpresaList(prev => prev.map(emp => ({
        ...emp,
        aiEvaluation: evaluations[emp.cnpj] || emp.aiEvaluation
      })));
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Requested entity was not found") || msg.includes("API key not valid") || msg.includes("API_KEY_MISSING")) {
        setHasApiKey(false);
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          setHasApiKey(true);
          // Tenta novamente após abrir o seletor
          try {
            const evaluations = await analyzeLeadsWithAI(resultsEmpresaList);
            setResultsEmpresaList(prev => prev.map(emp => ({
              ...emp,
              aiEvaluation: evaluations[emp.cnpj] || emp.aiEvaluation
            })));
          } catch (e2) { setError("Falha na autenticação mesmo após selecionar chave."); }
        } else {
          setError("Erro de API Key: Certifique-se de configurar a variável de ambiente API_KEY.");
        }
      } else {
        setError(msg || "Falha na análise de IA.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const performSearch = useCallback(async (params: FilterParams, view: ViewType, overrideOrgaoCnpj?: string, contextContract?: PNCPContrato) => {
    setLoading(true);
    setError(null);
    if (view === 'contratos') {
      setResultsContratos(null);
      setSelectedIds([]);
    }
    if (view === 'arquivos') setResultsArquivos(null);

    try {
      const safeParams = { ...params, cnpj: params.cnpj ? cleanCnpj(params.cnpj) : '' };

      if (view === 'contratos') {
        const response = await fetchContratos(safeParams);
        setResultsContratos(response);
      } else if (view === 'arquivos') {
        const targetCnpj = overrideOrgaoCnpj || safeParams.cnpj;
        if (!targetCnpj) throw new Error("CNPJ do órgão necessário para buscar arquivos.");
        const response = await fetchArquivosContrato({ ...safeParams, cnpj: targetCnpj });
        setResultsArquivos(response);
      } else if (view === 'empresa_info') {
        if (!safeParams.cnpj) throw new Error("CNPJ do fornecedor é necessário.");
        const info = await fetchEmpresaInfo(safeParams.cnpj);
        if (contextContract) {
          info.objetoOrigem = contextContract.objetoContrato;
          info.valorOrigem = contextContract.valorGlobal;
        }
        setResultsEmpresaList(prev => {
          const exists = prev.some(e => cleanCnpj(e.cnpj) === cleanCnpj(info.cnpj));
          if (exists) return prev;
          return [info, ...prev];
        });
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBatchCaptureContacts = async () => {
    if (!resultsContratos || selectedIds.length === 0) return;
    setBatchLoading(true);
    setBatchProgress({ current: 0, total: selectedIds.length });
    const selectedContracts = resultsContratos.data.filter(c => selectedIds.includes(c.numeroControlePNCP));
    const newEmpresas: EmpresaInfo[] = [];
    for (let i = 0; i < selectedContracts.length; i++) {
      const contract = selectedContracts[i];
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      try {
        const info = await fetchEmpresaInfo(cleanCnpj(contract.niFornecedor));
        info.objetoOrigem = contract.objetoContrato;
        info.valorOrigem = contract.valorGlobal;
        newEmpresas.push(info);
      } catch (err) { console.warn(err); }
      await new Promise(r => setTimeout(r, 100));
    }
    setResultsEmpresaList(prev => {
      const combined = [...prev];
      newEmpresas.forEach(emp => {
        if (!combined.some(e => cleanCnpj(e.cnpj) === cleanCnpj(emp.cnpj))) combined.push(emp);
      });
      return combined;
    });
    setBatchLoading(false);
    setActiveView('empresa_info');
    setSelectedIds([]);
  };

  const handleBatchViewDocuments = async () => {
    if (!resultsContratos || selectedIds.length === 0) return;
    setBatchLoading(true);
    setBatchProgress({ current: 0, total: selectedIds.length });
    const selectedContracts = resultsContratos.data.filter(c => selectedIds.includes(c.numeroControlePNCP));
    const allFiles: PNCPArquivo[] = [];
    for (let i = 0; i < selectedContracts.length; i++) {
      const contract = selectedContracts[i];
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      try {
        const parts = contract.numeroControlePNCP.split('-');
        const cnpjOrgao = cleanCnpj(parts[0]);
        const seqAno = parts[parts.length - 1].split('/');
        const response = await fetchArquivosContrato({ ...filters, cnpj: cnpjOrgao, ano: seqAno[1], sequencial: parseInt(seqAno[0], 10).toString() });
        allFiles.push(...response.data.map(f => ({ ...f, titulo: `[Contrato ${seqAno[0]}/${seqAno[1]}] ${f.titulo}` })));
      } catch (err) { console.warn(err); }
    }
    setResultsArquivos({ data: allFiles, totalPaginas: 1, totalRegistros: allFiles.length, numeroPagina: 1 });
    setBatchLoading(false);
    setActiveView('arquivos');
    setSelectedIds([]);
  };

  const handleExportLeadsCSV = () => {
    if (resultsEmpresaList.length === 0 || selectedIds.length === 0) return;
    const selectedLeads = resultsEmpresaList.filter(l => selectedIds.includes(l.cnpj));
    const exportData = selectedLeads.map(item => ({
      'Name': item.razao,
      'Position': '',
      'Company': item.razao,
      'Description': item.aiEvaluation?.justificativa || item.objetoOrigem || '',
      'Country': 'Brasil',
      'Zip': item.log_cep,
      'City': item.log_municipio,
      'State': item.log_uf,
      'Address': `${item.log_tipo} ${item.log_nome}, ${item.log_num} ${item.log_comp || ''}`,
      'Status': item.aiEvaluation?.classificacao || 'Lead Novo',
      'Source': 'PNCP Market Intelligence',
      'Email': item.email,
      'Website': item.site || '',
      'Phonenumber': item.tel_1 ? `(${item.ddd_1}) ${item.tel_1}` : '',
      'Lead value': item.valorOrigem || 0,
      'Tags': `PNCP, ${item.aiEvaluation?.classificacao || ''}, ${item.log_uf}`,
      'CNPJ': item.cnpj,
      'Ramo': item.cnae_principal,
      'Decisor': ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads_fg_seguros_${new Date().getTime()}.csv`);
  };

  const handleSelectChange = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (ids: string[]) => { setSelectedIds(ids); };

  useEffect(() => {
    if (activeView === 'contratos' && !resultsContratos) performSearch(filters, activeView);
  }, [activeView, performSearch]);

  const filteredData = useMemo(() => {
    const min = isNaN(filters.valorMinimo || 0) ? 0 : (filters.valorMinimo || 0);
    if (activeView === 'contratos' && resultsContratos) {
      return resultsContratos.data.filter(item => (item.valorGlobal || 0) >= min);
    }
    return null;
  }, [resultsContratos, filters.valorMinimo, activeView]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setFilters(prev => ({ ...prev, [name]: val, pagina: 1 }));
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(filters, activeView, activeView === 'arquivos' ? selectedContractOrgao : undefined);
  };

  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, pagina: newPage };
    setFilters(updatedFilters);
    performSearch(updatedFilters, activeView, activeView === 'arquivos' ? selectedContractOrgao : undefined);
  };

  const handleViewDocuments = (controlId: string, supplierCnpj: string) => {
    const parts = controlId.split('-');
    const cnpjOrgao = cleanCnpj(parts[0]);
    const seqAno = parts[parts.length - 1].split('/');
    setSelectedContractOrgao(cnpjOrgao);
    const newParams = { ...filters, cnpj: cleanCnpj(supplierCnpj), ano: seqAno[1], sequencial: parseInt(seqAno[0], 10).toString() };
    setFilters(newParams);
    setActiveView('arquivos');
    performSearch(newParams, 'arquivos', cnpjOrgao);
  };

  const handleViewEmpresa = (cnpj: string) => {
    const safeCnpj = cleanCnpj(cnpj);
    const contract = resultsContratos?.data.find(c => cleanCnpj(c.niFornecedor) === safeCnpj);
    setFilters(prev => ({ ...prev, cnpj: safeCnpj }));
    setActiveView('empresa_info');
    performSearch({ ...filters, cnpj: safeCnpj }, 'empresa_info', undefined, contract);
  };

  const handleRemoveEmpresa = (cnpj: string) => {
    setResultsEmpresaList(prev => prev.filter(e => cleanCnpj(e.cnpj) !== cleanCnpj(cnpj)));
    setSelectedIds(prev => prev.filter(id => id !== cnpj));
  };

  const currentResponse = activeView === 'contratos' ? resultsContratos :
    activeView === 'empresa_info' ? null : resultsArquivos;

  return (
    <div className="min-h-screen bg-[#fcfaf8] pb-24 font-sans text-slate-900">
      <nav className="bg-[#1e2d3d] text-[#e1c1a4] shadow-2xl mb-4 border-b border-[#e1c1a4]/20 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between h-auto md:h-20 items-center py-2 md:py-0 gap-4">
            <div className="flex items-center space-x-3">
              <FGLogo />
              <div className="flex flex-col">
                <span className="font-serif text-2xl tracking-tight leading-none text-[#e1c1a4]">F&G</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#e1c1a4]/80 font-bold">Corretora de Seguros</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-wrap justify-center bg-[#2a3c4f] p-1 rounded-full border border-[#e1c1a4]/10">
                {(['contratos', 'arquivos', 'empresa_info'] as ViewType[]).map((v) => (
                  <button key={v} onClick={() => { setActiveView(v); setSelectedIds([]); }} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-[#e1c1a4] text-[#1e2d3d] shadow-lg' : 'text-[#e1c1a4]/60 hover:text-[#e1c1a4] hover:bg-[#1e2d3d]/50'}`}>
                    {v === 'contratos' ? 'Contratos' : v === 'empresa_info' ? 'Lista de Contatos' : 'Documentos'}
                  </button>
                ))}
              </div>
              {!hasApiKey && window.aistudio && (
                <button onClick={handleConfigKey} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-pulse">
                  Ativar IA (Faturamento)
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto px-4">
        {batchLoading && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Processando em lote: {batchProgress.current} de {batchProgress.total}</div>
              <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-4">
          <form onSubmit={handleSearchClick} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-3 items-end">
            <div className="lg:col-span-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CNPJ do Fornecedor</label>
              <input type="text" name="cnpj" placeholder="Apenas números" value={filters.cnpj} onChange={handleFilterChange} className="block w-full rounded-xl border-slate-200 bg-slate-50 focus:ring-[#e1c1a4] text-xs p-2.5 border font-bold" />
            </div>
            {activeView === 'contratos' && (
              <>
                <div className="lg:col-span-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data Inicial</label>
                  <input type="date" name="dataInicial" value={filters.dataInicial} onChange={handleFilterChange} required className="block w-full rounded-xl border-slate-200 bg-slate-50 text-xs p-2.5 border font-bold" />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data Final</label>
                  <input type="date" name="dataFinal" value={filters.dataFinal} onChange={handleFilterChange} required className="block w-full rounded-xl border-slate-200 bg-slate-50 text-xs p-2.5 border font-bold" />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Valor Mínimo</label>
                  <input type="number" name="valorMinimo" value={filters.valorMinimo} onChange={handleFilterChange} className="block w-full rounded-xl border-slate-200 bg-slate-50 text-xs p-2.5 border font-bold" />
                </div>
              </>
            )}
            <div className="lg:col-span-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pág.</label>
              <input type="number" name="pagina" value={filters.pagina} onChange={handleFilterChange} className="block w-full rounded-xl border-slate-200 bg-slate-50 text-xs p-2.5 border font-bold" />
            </div>
            <div className="lg:col-span-2">
              <button type="submit" disabled={loading} className="w-full bg-[#1e2d3d] hover:bg-[#2a3c4f] text-[#e1c1a4] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all shadow-md text-[10px] h-[40px]">{loading ? 'Buscando...' : 'Atualizar Dados'}</button>
            </div>
          </form>
        </section>

        {error && <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl mb-4 text-[10px] text-rose-800 font-bold uppercase tracking-wider whitespace-pre-wrap">{error}</div>}

        <div className="flex justify-between items-center mb-3">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeView === 'empresa_info' ? `Leads: ${resultsEmpresaList.length}` : `Registros: ${currentResponse?.totalRegistros || 0}`}</div>
          {activeView === 'empresa_info' && resultsEmpresaList.length > 0 && (
            <button onClick={runAIAnalysis} disabled={aiLoading} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${aiLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg hover:scale-105 active:scale-95'}`}>{aiLoading ? 'Analisando...' : 'Qualificar com IA'}</button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {activeView === 'contratos' ? (
            <ContractTable data={(filteredData as PNCPContrato[]) || []} loading={loading} selectedIds={selectedIds} onSelectChange={handleSelectChange} onSelectAll={handleSelectAll} onViewDocuments={handleViewDocuments} onViewEmpresaInfo={handleViewEmpresa} />
          ) : activeView === 'empresa_info' ? (
            <CompanyListTable data={resultsEmpresaList} loading={loading} selectedIds={selectedIds} onSelectChange={handleSelectChange} onSelectAll={handleSelectAll} onRemove={handleRemoveEmpresa} />
          ) : (
            <DocumentListTable data={resultsArquivos?.data || []} loading={loading} cnpj={selectedContractOrgao} ano={filters.ano!} sequencial={filters.sequencial!} />
          )}
        </div>

        {activeView === 'contratos' && currentResponse && currentResponse.totalPaginas > 1 && (
          <Pagination currentPage={filters.pagina} totalPages={currentResponse.totalPaginas} totalRecords={currentResponse.totalRegistros} onPageChange={handlePageChange} />
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in">
          <div className="bg-[#1e2d3d] rounded-2xl shadow-2xl p-4 border border-[#e1c1a4]/20 flex items-center gap-6">
            <div className="flex flex-col"><span className="text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">{selectedIds.length} Selecionados</span><button onClick={() => setSelectedIds([])} className="text-[8px] font-bold text-[#e1c1a4]/50 uppercase tracking-widest hover:text-rose-400 text-left">Limpar</button></div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex gap-2">
              {activeView === 'contratos' ? (
                <>
                  <button onClick={handleBatchCaptureContacts} disabled={batchLoading} className="bg-[#e1c1a4] text-[#1e2d3d] hover:bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">Capturar Contatos (Lote)</button>
                  <button onClick={handleBatchViewDocuments} disabled={batchLoading} className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">Consolidar Documentos (Lote)</button>
                </>
              ) : (
                <button onClick={handleExportLeadsCSV} className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Exportar CSV Padrão CRM (Lote)</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-in { 0% { transform: translate(-50%, 100px); opacity: 0; } 70% { transform: translate(-50%, -10px); opacity: 1; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
};

export default App;
