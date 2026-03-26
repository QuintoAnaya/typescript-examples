/**
 * Basic RAG Implementation
 *
 * Costs & Safety: Real API calls; keep inputs small. Requires API key(s).
 * Module reference: [Basic RAG Implementation](https://aitutorial.dev/rag/rag-fundamentals#basic-rag-implementation)
 * Why: Demonstrates the fundamental Retrieval-Augmented Generation pattern: retrieve context first, then generate answer.
 */

import { generateText } from 'ai';
import { createModel } from './utils.js';
import { join } from 'path';
import { readFileSync } from 'fs';
import { SemanticRetriever } from './utils/semantic_retriever';

const essay = readFileSync(join(process.cwd(), 'assets', 'paul_graham_essay.txt'), 'utf-8');

/**
 * Retrieve relevant documents and generate an answer using the provided context
 */
async function ragQuery(model: ReturnType<typeof createModel>, retriever: SemanticRetriever, question: string, topK = 3): Promise<string> {
    // Retrieve relevant documents
    const results = await retriever.searchRanked(question, topK);
    const retrievedDocs = results.map(r => r.document);
    const context = retrievedDocs.join('\n\n');

    console.log('');
    console.log(`Retrieved Context (${retrievedDocs.length} docs):`);
    console.log('---');
    console.log(`${context}`);
    console.log('---');

    // Generate answer using retrieved context
    const { text } = await generateText({
        model,
        messages: [
            {
                role: 'system',
                content: 'Answer based only on the provided context. If the context doesn\'t contain the answer, say so.',
            },
            {
                role: 'user',
                content: `Context:\n${context}\n\nQuestion: ${question}`,
            },
        ],
    });

    return text;
}

/**
 * Main function that demonstrates a simple RAG implementation
 *
 * This example shows how to create a semantic (vector) index for documents,
 * retrieve relevant chunks for a query, and use the retrieved context to generate an answer.
 *
 * This is a single-stage RAG approach suitable for prototypes and simple use cases.
 */
async function main(): Promise<void> {
    const model = createModel();

    // Step 1: Split the essay into chunks (paragraphs)
    const documents = essay
        .split('\n\n')
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0);

    console.log(`Loaded ${documents.length} chunks from the essay.`);

    // Step 2: Build the semantic index
    const retriever = await SemanticRetriever.create(documents);

    // Step 3: Query the RAG pipeline
    const question = 'What did the author work on before college?';
    console.log(`Question: ${question}`);

    const answer = await ragQuery(model, retriever, question);

    console.log('');
    console.log('Answer:');
    console.log(`${answer}`);
}

await main();
