/**
 * Basic RAG Implementation
 *
 * Costs & Safety: Real API calls; keep inputs small. Requires API key(s).
 * Module reference: [Basic RAG Implementation](https://aitutorial.dev/rag/rag-fundamentals#basic-rag-implementation)
 * Why: Demonstrates the fundamental RAG pattern in its simplest form: fetch today's news, use it as context, answer a question the LLM alone cannot.
 */

import { generateText } from 'ai';
import { createModel } from './utils.js';

/**
 * Fetch a web page and return its text content (stripped of HTML tags)
 */
async function fetchPage(url: string): Promise<string> {
    const response = await fetch(url);
    const html = await response.text();
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Main function that demonstrates the simplest possible RAG
 *
 * This example shows RAG in three steps:
 * 1. RETRIEVE — fetch today's news headlines from Reuters
 * 2. AUGMENT — insert the content into the prompt as context
 * 3. GENERATE — have the LLM answer using only that context
 *
 * The model's training data has a cutoff date, so it can't know today's news.
 * RAG bridges this gap by retrieving fresh data at query time.
 */
async function main(): Promise<void> {
    const model = createModel();

    // Step 1: RETRIEVE — fetch today's headlines from Reuters
    const url = 'https://www.reuters.com/markets/';
    console.log(`Fetching: ${url}`);
    const pageContent = await fetchPage(url);
    console.log(`Retrieved ${pageContent.length} characters`);

    // Step 2: AUGMENT + GENERATE — pass the content as context and ask a question
    const question = 'What are the top market stories today? Summarize the key headlines.';
    console.log(`Question: ${question}`);

    const { text } = await generateText({
        model,
        messages: [
            {
                role: 'system',
                content: 'Answer based only on the provided context. If the context does not contain the answer, say so.',
            },
            {
                role: 'user',
                content: `Context:\n${pageContent.slice(0, 8000)}\n\nQuestion: ${question}`,
            },
        ],
    });

    console.log('');
    console.log('Answer:');
    console.log(`${text}`);
}

await main();
