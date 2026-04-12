import { ExtractorClient } from '@portscope/extractor-client';
import { PrismaService } from '@portscope/db';

const extractor = new ExtractorClient(
  process.env.EXTRACTOR_URL ?? 'http://localhost:8001',
);

const prisma = new PrismaService();

export async function classifyDocument(input: {
  s3Key: string;
}): Promise<string> {
  const result = await extractor.classify(input.s3Key);
  return result.documentType;
}

export async function extractDocument(input: {
  s3Key: string;
  docType: string;
}): Promise<{ fields: Array<{ key: string; value: string; confidence: number; label: string; fieldType: string }> }> {
  return extractor.extract(input.s3Key, input.docType);
}

export async function storeExtraction(input: {
  documentId: string;
  extraction: { fields: Array<{ key: string; value: string; confidence: number }> };
  docType: string;
  corrections: Record<string, string>;
}): Promise<void> {
  const mergedFields = input.extraction.fields.map((f) => ({
    ...f,
    value: input.corrections[f.key] ?? f.value,
  }));

  await prisma.document.update({
    where: { id: input.documentId },
    data: {
      type: input.docType,
      status: 'APPROVED',
      extractedFields: mergedFields as any,
      processedAt: new Date(),
    },
  });
}

export async function notifyReview(input: {
  documentId: string;
  extraction: { fields: Array<{ key: string; value: string; confidence: number }> };
  docType: string;
}): Promise<void> {
  const flaggedCount = input.extraction.fields.filter(
    (f) => f.confidence < 0.85,
  ).length;

  await prisma.document.update({
    where: { id: input.documentId },
    data: {
      type: input.docType,
      status: 'REVIEW',
      extractedFields: input.extraction.fields as any,
      flaggedFieldCount: flaggedCount,
    },
  });

  // TODO: Send email notification to staff reviewer
}

export async function persistCapitalEvents(input: {
  documentId: string;
  extraction: { fields: Array<{ key: string; value: string; confidence: number }> };
}): Promise<void> {
  const fields = Object.fromEntries(
    input.extraction.fields.map((f) => [f.key, f.value]),
  );

  // TODO: Create CapitalEvent record from extracted fields
  // This requires mapping the document to a specific holding
  console.log('Would persist capital event for document', input.documentId, fields);
}

export async function storeCorrectionsForTraining(input: {
  documentId: string;
  corrections: Record<string, string>;
}): Promise<void> {
  await prisma.document.update({
    where: { id: input.documentId },
    data: { corrections: input.corrections as any },
  });
}
