
import React, { useState } from 'react';
import { PNCPArquivo } from '../types';
import { formatDateBRL } from '../utils/formatters';
import { downloadArquivoPncp } from '../services/pncpService';

interface DocumentListTableProps {
  data: PNCPArquivo[];
  loading: boolean;
  cnpj: string;
  ano: string;
  sequencial: string;
}

const DocumentListTable: React.FC<DocumentListTableProps> = ({ data, loading, cnpj, ano, sequencial }) => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDownload = async (doc: PNCPArquivo) => {
    try {
      setDownloadingId(doc.sequencialDocumento);
      setLocalError(null);
      
      const fileName = doc.nomeArquivo || doc.titulo;
      
      await downloadArquivoPncp(cnpj, ano, sequencial, doc.sequencialDocumento, fileName, doc.url);
    } catch (err: any) {
      setLocalError(`Falha ao baixar "${doc.titulo}": ${err.message}`);
      setTimeout(() => setLocalError(null), 6000);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Consultando Documentação...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h3 className="text-slate-900 font-black text-lg">Repositório Vazio</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">Não encontramos arquivos anexados para este contrato no PNCP.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      {localError && (
        <div className="m-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center animate-pulse">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          {localError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-50">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Publicação</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((doc) => {
              const isEdital = doc.tipoDocumentoId === 2 || doc.tipoDocumentoNome.toLowerCase().includes('edital');
              const isDownloading = downloadingId === doc.sequencialDocumento;

              return (
                <tr key={doc.sequencialDocumento} className={`hover:bg-slate-50/80 transition-colors ${isEdital ? 'bg-indigo-50/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${isEdital ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-slate-800 leading-none">{doc.titulo}</span>
                          {isEdital && (
                            <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">Principal</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-xs md:max-w-2xl">
                          {doc.tipoDocumentoNome} • {doc.nomeArquivo || 'arquivo_sem_nome'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/50">
                      {formatDateBRL(doc.dataPublicacaoPncp)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={isDownloading}
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                        isEdital 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-[#1e2d3d] text-[#e1c1a4] hover:bg-[#2a3c4f]'
                      }`}
                    >
                      {isDownloading ? 'Processando...' : 'Baixar'}
                    </button>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1e2d3d] border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Abrir Link Original
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentListTable;
