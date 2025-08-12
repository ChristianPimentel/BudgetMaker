'use server';

/**
 * @fileOverview Automatically categorizes receipts using AI.
 *
 * - categorizeReceipt - A function that handles the receipt categorization process.
 * - CategorizeReceiptInput - The input type for the categorizeReceipt function.
 * - CategorizeReceiptOutput - The return type for the categorizeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeReceiptInputSchema = z.object({
  vendorName: z.string().describe('The name of the vendor on the receipt.'),
  description: z.string().describe('A description of the purchase on the receipt.'),
});
export type CategorizeReceiptInput = z.infer<typeof CategorizeReceiptInputSchema>;

const CategorizeReceiptOutputSchema = z.object({
  category: z.string().describe('The predicted category of the receipt.'),
  confidence: z.number().describe('The confidence level of the categorization (0-1).'),
});
export type CategorizeReceiptOutput = z.infer<typeof CategorizeReceiptOutputSchema>;

export async function categorizeReceipt(input: CategorizeReceiptInput): Promise<CategorizeReceiptOutput> {
  return categorizeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeReceiptPrompt',
  input: {schema: CategorizeReceiptInputSchema},
  output: {schema: CategorizeReceiptOutputSchema},
  prompt: `You are an expert financial advisor. You will categorize receipts based on the vendor name and description.

  Here are the categories you can use: Spending, Fun

  Vendor Name: {{{vendorName}}}
  Description: {{{description}}}

  Respond with only the category and a confidence level between 0 and 1, as a JSON object.
  `,
});

const categorizeReceiptFlow = ai.defineFlow(
  {
    name: 'categorizeReceiptFlow',
    inputSchema: CategorizeReceiptInputSchema,
    outputSchema: CategorizeReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
