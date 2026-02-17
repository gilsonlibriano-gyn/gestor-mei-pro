
import { GoogleGenAI } from "@google/genai";
import { Transaction, Config } from "../types";

export async function getSmartInsights(transactions: Transaction[], config: Config) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const totalRevenueYear = transactions
    .filter(t => t.type === 'Venda' && new Date(t.date).getFullYear() === year)
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalRevenueMonth = transactions
    .filter(t => t.type === 'Venda' && new Date(t.date).getFullYear() === year && (new Date(t.date).getMonth() + 1) === month)
    .reduce((acc, curr) => acc + curr.value, 0);

  const prompt = `
    Você é um consultor financeiro e tributário especializado em MEI (Microempreendedor Individual) no Brasil.
    Seu objetivo é analisar os dados da empresa e fornecer orientações estratégicas de alto valor.

    DADOS DA EMPRESA:
    - Nome: ${config.companyName || 'Empreendedor não identificado'}
    - Limite Anual Configurado: R$ ${config.annualLimit.toLocaleString('pt-BR')}
    - Faturamento Acumulado no Ano (${year}): R$ ${totalRevenueYear.toLocaleString('pt-BR')}
    - Faturamento no Mês Atual: R$ ${totalRevenueMonth.toLocaleString('pt-BR')}
    - Número de Transações Recentes: ${transactions.length}

    REGRAS DE OURO:
    1. Seja conciso, mas profissional e encorajador.
    2. Use termos técnicos brasileiros (DAS, DASN-SIMEI, Inscrição Estadual, etc).
    3. Se o faturamento anual estiver perto de 80% do limite, dê um alerta sério sobre o desenquadramento.
    4. Sugira 3 passos práticos para este mês.

    ESTRUTURA DA RESPOSTA (Markdown):
    - 📊 **Análise de Saúde Financeira**: Uma frase sobre como os números parecem.
    - ⚠️ **Alerta Tributário**: Informação sobre o limite MEI e obrigações (DASN/DAS).
    - 💡 **Dicas de Crescimento**: 3 tópicos com emojis.
    - 🎯 **Conclusão**: Uma frase motivacional.

    Responda apenas em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Ops! Tive um problema ao processar seus dados. Verifique se suas transações estão preenchidas corretamente e tente novamente.";
  }
}
