
import React from 'react';
import { EmpresaInfo } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';

interface CompanyListTableProps {
  data: EmpresaInfo[];
  loading: boolean;
  selectedIds: string[];
  onSelectChange: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onRemove: (cnpj: string) => void;
}

const CompanyListTable: React.FC<CompanyListTableProps> = ({ 
  data, 
  loading, 
  selectedIds,
  onSelectChange,
  onSelectAll,
  onRemove 
}) => {
  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Puxando ficha completa...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-20 bg-white border-2 border-dashed border-slate-100 rounded-3xl m-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sua lista de inteligência está vazia.</p>
        <p className="text-slate-300 text-[10px] mt-2 italic">Capture dados clicando no ícone 🏢 em 'Contratos'.</p>
      </div>
    );
  }

  const allCnpjs = data.map(item => item.cnpj);
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  const getRankStyle = (rank: string) => {
    switch (rank) {
      case 'OURO': return 'bg-amber-100 text-amber-800 border-amber-200 shadow-amber-100';
      case 'PRATA': return 'bg-slate-100 text-slate-700 border-slate-200 shadow-slate-100';
      case 'BRONZE': return 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-50';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1800px] divide-y divide-slate-100">
        <thead className="bg-[#1e2d3d]">
          <tr>
            <th className="px-4 py-3 text-center w-10 sticky left-0 bg-[#1e2d3d] z-20">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={() => onSelectAll(isAllSelected ? [] : allCnpjs)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </th>
            <th className="px-4 py-4 text-center text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest sticky left-[50px] bg-[#1e2d3d] z-10 w-[80px]">Ações</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-[250px]">IA Qualificação</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-[300px]">Identificação</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-[300px]">Contatos</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-[250px]">Endereço</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-[250px]">Financeiro</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest">Atividade</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((empresa) => {
            const isSelected = selectedIds.includes(empresa.cnpj);
            return (
              <tr key={empresa.cnpj} className={`transition-colors align-top ${isSelected ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                <td className="px-4 py-6 text-center sticky left-0 bg-white z-20 border-r border-slate-50">
                   <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => onSelectChange(empresa.cnpj)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-6 text-center sticky left-[50px] bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                  <button 
                    onClick={() => onRemove(empresa.cnpj)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100 rounded-lg"
                    title="Remover Lead"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
                <td className="px-6 py-6 bg-amber-50/10">
                  {empresa.aiEvaluation ? (
                    <div className="space-y-3">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-widest uppercase shadow-sm ${getRankStyle(empresa.aiEvaluation.classificacao)}`}>
                        {empresa.aiEvaluation.classificacao === 'OURO' && <span className="mr-1.5 text-lg">✨</span>}
                        {empresa.aiEvaluation.classificacao} • {empresa.aiEvaluation.score} PTS
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold leading-relaxed border-l-2 border-amber-300 pl-2">
                        {empresa.aiEvaluation.justificativa}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${empresa.aiEvaluation.score > 70 ? 'bg-amber-500' : 'bg-slate-400'}`} 
                              style={{ width: `${empresa.aiEvaluation.score}%` }}
                            ></div>
                         </div>
                         <span className="text-[8px] font-black text-slate-400 uppercase">{empresa.aiEvaluation.score}% POTENCIAL</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-4 opacity-40">
                      <div className="w-8 h-8 border-2 border-dashed border-slate-300 rounded-full mb-2"></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">Aguardando IA</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-6">
                  <div className="text-sm font-black text-slate-800 uppercase leading-none mb-1 truncate" title={empresa.razao}>{empresa.razao}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 truncate">{empresa.fantasia || 'Sem Nome Fantasia'}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{empresa.cnpj}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${empresa.situacao_cadastral === '2' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                      {empresa.situacao_cadastral === '2' ? 'ATIVA' : 'INATIVA'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      </div>
                      <span className="text-sm font-black text-slate-700 tracking-tight">({empresa.ddd_1 || '??'}) {empresa.tel_1 || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 lowercase truncate max-w-[150px]">{empresa.email || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="text-[11px] font-bold text-slate-700 leading-snug">
                    {empresa.log_tipo} {empresa.log_nome}, {empresa.log_num}<br/>
                    <span className="text-orange-600 uppercase text-[9px] font-black">{empresa.log_municipio} - {empresa.log_uf}</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Capital Social</div>
                      <div className="text-xs font-black text-emerald-600">{formatCurrencyBRL(Number(empresa.capital_social))}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Porte</div>
                      <div className="text-[10px] font-bold text-indigo-600 uppercase">Porte {empresa.porte}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 max-w-[300px]">
                  <div className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1">CNAE Principal</div>
                  <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-orange-100 pl-2 mb-2">
                    {empresa.cnae_principal}
                  </p>
                  {empresa.objetoOrigem && (
                    <>
                      <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Objeto do Contrato</div>
                      <p className="text-[9px] text-slate-400 font-medium line-clamp-2" title={empresa.objetoOrigem}>{empresa.objetoOrigem}</p>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyListTable;
