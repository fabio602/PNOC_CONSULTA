
import React from 'react';
import { EmpresaInfo } from '../types';
import { formatCurrencyBRL, formatDateBRL } from '../utils/formatters';

interface CompanyDetailsTableProps {
  data: EmpresaInfo | null;
  loading: boolean;
}

const CompanyDetailsTable: React.FC<CompanyDetailsTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Consultando EmpresaAqui...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma empresa selecionada ou encontrada.</p>
        <p className="text-slate-300 text-[10px] mt-2 italic">Selecione uma empresa na lista de contratos para ver detalhes.</p>
      </div>
    );
  }

  // Define Badge with optional children to satisfy TS when used in JSX
  const Badge = ({ children, color = "blue" }: { children?: React.ReactNode, color?: string }) => (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-${color}-50 text-${color}-700 border border-${color}-100`}>
      {children}
    </span>
  );

  // Fix: Adjusted property names according to EmpresaInfo interface defined in types.ts
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 animate-fade-in">
      <div className="p-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">{data.razao}</h2>
              <Badge color={data.situacao_cadastral === '2' ? 'emerald' : 'rose'}>
                {data.situacao_cadastral === '2' ? 'ATIVA' : 'INATIVA'}
              </Badge>
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{data.fantasia || 'Sem nome fantasia'}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CNPJ</div>
            <div className="text-lg font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-sm inline-block">
              {data.cnpj}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Coluna 1: Dados Cadastrais */}
        <div className="p-6 space-y-6">
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">Dados Cadastrais</h3>
          
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Abertura</label>
            <p className="text-sm font-bold text-slate-700">{formatDateBRL(data.data_abertura)}</p>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Porte / Natureza</label>
            <p className="text-sm font-bold text-slate-700">{data.porte}</p>
            <p className="text-[10px] text-slate-500 mt-1">{data.natureza_juridica}</p>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital Social</label>
            <p className="text-lg font-black text-emerald-600">{formatCurrencyBRL(Number(data.capital_social))}</p>
          </div>
        </div>

        {/* Coluna 2: Localização e Contato */}
        <div className="p-6 space-y-6">
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">Localização e Contato</h3>
          
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço</label>
            <p className="text-sm font-bold text-slate-700 leading-snug">
              {data.log_tipo} {data.log_nome}, {data.log_num}<br />
              {data.log_bairro} - {data.log_municipio}/{data.log_uf}<br />
              CEP: {data.log_cep}
            </p>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</label>
            <p className="text-sm font-bold text-slate-700">{data.tel_1 ? `(${data.ddd_1}) ${data.tel_1}` : 'Não informado'}</p>
            <p className="text-[10px] font-medium text-indigo-600 lowercase mt-1">{data.email || 'sem-email@informado.com'}</p>
          </div>
        </div>

        {/* Coluna 3: Atividade Econômica */}
        <div className="p-6 space-y-6">
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">Atividade Principal</h3>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
              "{data.cnae_principal}"
            </p>
          </div>
          
          <div className="pt-4">
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">
               Dados fornecidos por EmpresaAqui
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsTable;
