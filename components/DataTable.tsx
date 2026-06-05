
import React from 'react';
import { PNCPContratacao } from '../types';
import { formatDateBRL, formatCurrencyBRL } from '../utils/formatters';

interface DataTableProps {
  data: PNCPContratacao[];
  loading: boolean;
  onViewDocuments?: (controlId: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, loading, onViewDocuments }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e2d3d]"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sincronizando PNCP...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-20 bg-white">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sem dados no período.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-[#1e2d3d]">
          <tr>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Docs</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Data Atu.</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Modalidade</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Situação</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Valor Estimado</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-[#e1c1a4] uppercase tracking-widest">Órgão</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr key={`${item.numeroControlePNCP}-${index}`} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  onClick={() => onViewDocuments?.(item.numeroControlePNCP)}
                  className="p-2 text-[#1e2d3d] hover:bg-[#e1c1a4]/20 rounded-lg transition-colors border border-slate-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-600">{formatDateBRL(item.dataAtualizacao)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-bold">{item.modalidadeNome}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${item.situacaoCompraNome === 'Publicada' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                  {item.situacaoCompraNome}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#1e2d3d]">{formatCurrencyBRL(item.valorTotalEstimado)}</td>
              <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate uppercase font-medium">
                {item.orgaoEntidade.razaoSocial}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
