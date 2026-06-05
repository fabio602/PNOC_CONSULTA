
import React from 'react';
import { PNCPContrato } from '../types';
import { formatDateBRL, formatCurrencyBRL } from '../utils/formatters';

interface ContractTableProps {
  data: PNCPContrato[];
  loading: boolean;
  selectedIds: string[];
  onSelectChange: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onViewDocuments?: (buyControlId: string, supplierCnpj: string) => void;
  onViewEmpresaInfo?: (cnpj: string) => void;
}

const ContractTable: React.FC<ContractTableProps> = ({ 
  data, 
  loading, 
  selectedIds, 
  onSelectChange, 
  onSelectAll,
  onViewDocuments, 
  onViewEmpresaInfo 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-gray-600 font-medium uppercase tracking-widest text-[10px]">Buscando contratos no PNCP...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum contrato encontrado.</p>
      </div>
    );
  }

  const allIds = data.map(item => item.numeroControlePNCP);
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#1e2d3d]">
          <tr>
            <th className="px-4 py-3 text-center w-10">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={() => onSelectAll(isAllSelected ? [] : allIds)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </th>
            <th className="px-2 py-3 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-16">Ações</th>
            <th className="px-2 py-3 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-24">Assinatura</th>
            <th className="px-3 py-3 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-72">Fornecedor</th>
            <th className="px-3 py-3 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest">Objeto do Contrato</th>
            <th className="px-3 py-3 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-32">Valor Global</th>
            <th className="px-3 py-3 text-left text-[9px] font-black text-[#e1c1a4] uppercase tracking-widest w-64">Órgão Público</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item, index) => {
            const isSelected = selectedIds.includes(item.numeroControlePNCP);

            return (
              <tr 
                key={`${item.numeroControlePNCP}-${index}`} 
                className={`transition-colors group ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
              >
                <td className="px-4 py-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => onSelectChange(item.numeroControlePNCP)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => onViewDocuments?.(item.numeroControlePNCP, item.niFornecedor)}
                      title="Ver Documentos do Contrato"
                      className="p-1 text-[#1e2d3d] hover:bg-[#e1c1a4]/30 rounded transition-colors border border-slate-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    {onViewEmpresaInfo && (
                      <button 
                        onClick={() => onViewEmpresaInfo(item.niFornecedor)}
                        title="Detalhes e Contatos do Fornecedor"
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors border border-orange-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-[10px] font-bold text-slate-600">
                  {formatDateBRL(item.dataAssinatura)}
                </td>
                <td className="px-3 py-3">
                  <div className="text-[10px] font-black text-slate-800 uppercase line-clamp-1 leading-tight" title={item.nomeRazaoSocialFornecedor}>
                    {item.nomeRazaoSocialFornecedor}
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold">CNPJ/CPF: {item.niFornecedor}</div>
                </td>
                <td className="px-3 py-3 text-[10px] text-slate-600">
                  <p className="line-clamp-2 leading-tight" title={item.objetoContrato}>{item.objetoContrato}</p>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-[11px] font-black text-emerald-700">
                  {formatCurrencyBRL(item.valorGlobal)}
                </td>
                <td className="px-3 py-3">
                  <div className="text-[9px] text-slate-500 uppercase font-black line-clamp-1 leading-none" title={item.orgaoEntidade.razaoSocial}>
                    {item.orgaoEntidade.razaoSocial}
                  </div>
                  <div className="text-[7px] text-slate-300 font-bold">CNPJ: {item.orgaoEntidade.cnpj}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContractTable;
