
import React from 'react';
import { PNCPItemResultado } from '../types';
import { formatDateBRL, formatCurrencyBRL } from '../utils/formatters';

interface ItemResultTableProps {
  data: PNCPItemResultado[];
  loading: boolean;
}

const ItemResultTable: React.FC<ItemResultTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Buscando resultados do item...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Nenhum resultado homologado encontrado para este item.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-orange-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Seq.</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Fornecedor</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Qtd. Homologada</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Vlr. Unitário</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Vlr. Total</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Data Homol.</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Situação</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={`${item.sequencialResultado}-${index}`} className="hover:bg-orange-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.sequencialResultado}</td>
              <td className="px-4 py-4 text-sm">
                <div className="font-bold text-gray-900 uppercase">{item.nomeRazaoSocialFornecedor}</div>
                <div className="text-xs text-gray-500">CNPJ/CPF: {item.niFornecedor}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{item.quantidadeHomologada}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrencyBRL(item.valorUnitarioHomologado)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-emerald-700">{formatCurrencyBRL(item.valorTotalHomologado)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateBRL(item.dataHomologacao)}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  {item.tipoResultadoNome || 'Homologado'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemResultTable;
