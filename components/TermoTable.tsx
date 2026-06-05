
import React from 'react';
import { PNCPTermoContrato } from '../types';
import { formatDateBRL, formatCurrencyBRL } from '../utils/formatters';

interface TermoTableProps {
  data: PNCPTermoContrato[];
  loading: boolean;
}

const TermoTable: React.FC<TermoTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Buscando Termos Aditivos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Nenhum termo aditivo/apostilamento encontrado.</p>
        <p className="text-slate-400 text-[10px] mt-2 italic">Certifique-se de que o CNPJ, Ano e Sequencial do contrato estão corretos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-[#1e2d3d]">
          <tr>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Nº Termo</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Tipo / Qualificações</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Objeto</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Data Assin.</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Vlr. Acrescido</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Vlr. Global</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr key={`${item.numeroTermoContrato}-${index}`} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-black text-slate-700">{item.numeroTermoContrato}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Seq: {item.sequencialTermoContrato}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{item.tipoTermoContratoNome || 'Termo Aditivo'}</div>
                <div className="flex flex-wrap gap-1">
                  {item.qualificacaoAcrescimoSupressao && <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-100 uppercase">Acréscimo</span>}
                  {item.qualificacaoVigencia && <span className="bg-purple-50 text-purple-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-purple-100 uppercase">Vigência</span>}
                  {item.qualificacaoFornecedor && <span className="bg-orange-50 text-orange-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-orange-100 uppercase">Fornecedor</span>}
                  {item.qualificacaoReajuste && <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-100 uppercase">Reajuste</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-md line-clamp-3" title={item.objetoTermoContrato}>
                  {item.objetoTermoContrato}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500">{formatDateBRL(item.dataAssinatura)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-rose-600">{formatCurrencyBRL(item.valorAcrescido)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">{formatCurrencyBRL(item.valorGlobal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Fonte: PNCP API - Termos de Contrato</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consumo v1/termos</span>
      </div>
    </div>
  );
};

export default TermoTable;
