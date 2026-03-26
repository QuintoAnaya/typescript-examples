/**
 * Basic RAG Implementation
 *
 * Costs & Safety: Real API calls; keep inputs small. Requires API key(s).
 * Module reference: [Basic RAG Implementation](https://aitutorial.dev/rag/rag-fundamentals#basic-rag-implementation)
 * Why: Demonstrates the fundamental RAG pattern in its simplest form: retrieve relevant context, augment the prompt, generate an answer.
 */

import { generateText } from 'ai';
import { createModel } from './utils.js';

/**
 * Simulate a company knowledge base that the LLM has never seen.
 * In production, this would be a database, API, or document store.
 */
const companyDocuments = [
    'MySecretCompany Q4 2024 Financial Report: Revenue was $2.3B, up 15% year-over-year. Operating margin improved to 22%. Net income was $450M.',
    'MySecretCompany Q3 2024 Financial Report: Revenue was $1.9B. The company launched MindFlow Pro, which drove 30% of new enterprise deals.',
    'MySecretCompany Engineering Blog - January 2025: We migrated our infrastructure to Kubernetes, reducing deployment times by 60%.',
    'MySecretCompany HR Policy: PTO is 25 days per year. Remote work is allowed 3 days per week. Health insurance covers dental and vision.',
    'MySecretCompany Product Roadmap 2025: AI-powered mind mapping features planned for Q2. Mobile app redesign scheduled for Q3.',
];

/**
 * Simple keyword search — find documents that match the query terms
 */
function retrieve(documents: string[], query: string, topK = 2): string[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scored = documents.map(doc => ({
        doc,
        score: queryWords.filter(w => doc.toLowerCase().includes(w)).length,
    }));
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.doc);
}

/**
 * Main function that demonstrates the simplest possible RAG
 *
 * This example shows RAG in three steps:
 * 1. RETRIEVE — find relevant documents from a knowledge base
 * 2. AUGMENT — insert the documents into the prompt as context
 * 3. GENERATE — have the LLM answer using only that context
 *
 * Without RAG, the model would say "I don't have access to MySecretCompany's data."
 * With RAG, it answers accurately from the company's own documents.
 */
async function main(): Promise<void> {
    const model = createModel();

    // Step 1: RETRIEVE — find relevant documents for the question
    const question = 'What was MySecretCompany Q4 2024 revenue?';
    console.log(`Question: ${question}`);

    const relevantDocs = retrieve(companyDocuments, question);
    console.log(`Retrieved ${relevantDocs.length} relevant documents`);
    relevantDocs.forEach((doc, i) => console.log(`  [${i + 1}] ${doc.slice(0, 80)}...`));

    // Step 2: AUGMENT + GENERATE — pass the documents as context
    const context = relevantDocs.join('\n\n');

    const { text } = await generateText({
        model,
        messages: [
            {
                role: 'system',
                content: 'Answer based only on the provided context. If the context does not contain the answer, say so.',
            },
            {
                role: 'user',
                content: `Context:\n${context}\n\nQuestion: ${question}`,
            },
        ],
    });

    console.log('');
    console.log('Answer:');
    console.log(`${text}`);
}

await main();
