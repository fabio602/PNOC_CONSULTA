
import { GoogleGenAI, Type } from "@google/genai";
import { EmpresaInfo, AIEvaluation } from "../types";

export const analyzeLeadsWithAI = async (leads: EmpresaInfo[]): Promise<Record<string, AIEvaluation>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  // Sempre criamos uma nova instância para garantir o uso da chave mais recente do ambiente
  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta'
  });

  const leadDataForAI = leads.map(l => ({
    cnpj: l.cnpj,
    razao: l.razao,
    objeto: l.objetoOrigem || "Não informado",
    valor: l.valorOrigem || 0,
    cnae: l.cnae_principal,
    capital: l.capital_social
  }));

  const prompt = `Você é um especialista em Inteligência de Mercado para Corretoras de Seguros no Brasil.
  Analise os seguintes leads vindos do PNCP (Portal Nacional de Contratações Públicas).
  Seu objetivo é identificar quais empresas têm maior probabilidade de precisar contratar um SEGURO GARANTIA.
  
  Critérios:
  1. OURO: Obras de engenharia, reformas vultuosas, TI complexa, valores > R$ 500k.
  2. PRATA: Serviços contínuos, manutenção, fornecimento técnico.
  3. BRONZE/BAIXO: Compras de prateleira ou valores baixos.

  IMPORTANTE: Retorne APENAS um objeto JSON válido no seguinte formato:
  [
    {
      "cnpj": "string",
      "score": number (0-100),
      "classificacao": "OURO" | "PRATA" | "BRONZE" | "BAIXO",
      "justificativa": "string",
      "probabilidadeGarantia": number (0-1)
    }
  ]
  
  Dados dos leads: ${JSON.stringify(leadDataForAI)}`;

  try {
    const result_ai = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cnpj: { type: Type.STRING },
              score: { type: Type.NUMBER },
              classificacao: { type: Type.STRING },
              justificativa: { type: Type.STRING },
              probabilidadeGarantia: { type: Type.NUMBER }
            },
            required: ["cnpj", "score", "classificacao", "justificativa", "probabilidadeGarantia"]
          }
        }
      }
    });

    const responseText = result_ai.text || "";
    // Limpa possíveis marcações de markdown do JSON se o modelo teimar em retornar
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const evaluations: any[] = JSON.parse(cleanJson || "[]");

    const result: Record<string, AIEvaluation> = {};

    evaluations.forEach(ev => {
      result[ev.cnpj] = {
        score: ev.score,
        classificacao: ev.classificacao,
        justificativa: ev.justificativa,
        probabilidadeGarantia: ev.probabilidadeGarantia
      };
    });

    return result;
  } catch (e: any) {
    console.error("Erro na análise da IA:", e);
    // Propaga erros de autenticação para o App.tsx lidar
    if (e.message?.includes("API key not valid") || e.message?.includes("403") || e.message?.includes("401") || e.message?.includes("API_KEY_MISSING")) {
      throw new Error("API_KEY_MISSING");
    }
    throw e;
  }
};
