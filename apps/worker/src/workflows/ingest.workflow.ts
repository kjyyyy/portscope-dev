import {
  proxyActivities,
  condition,
  setHandler,
  defineSignal,
  log,
} from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  classifyDocument,
  extractDocument,
  storeExtraction,
  notifyReview,
  persistCapitalEvents,
  storeCorrectionsForTraining,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '30s',
    backoffCoefficient: 2,
  },
});

export const approvalSignal = defineSignal<
  [{ approved: boolean; corrections: Record<string, string> }]
>('approval');

export async function ingestDocumentWorkflow(input: {
  documentId: string;
  s3Key: string;
  familyOfficeId: string;
}): Promise<void> {
  const docType = await classifyDocument({ s3Key: input.s3Key });
  log.info('classified', { docType, documentId: input.documentId });

  const extraction = await extractDocument({
    s3Key: input.s3Key,
    docType,
  });

  const needsReview = extraction.fields.some(
    (f: { confidence: number }) => f.confidence < 0.85,
  );

  let corrections: Record<string, string> = {};

  if (needsReview) {
    await notifyReview({
      documentId: input.documentId,
      extraction,
      docType,
    });

    let approved = false;
    setHandler(approvalSignal, (payload) => {
      approved = payload.approved;
      corrections = payload.corrections;
    });

    const didSignal = await condition(() => approved, '7 days');
    if (!didSignal) {
      throw new Error('Review timed out — escalating to DLQ');
    }

    if (Object.keys(corrections).length > 0) {
      await storeCorrectionsForTraining({
        documentId: input.documentId,
        corrections,
      });
    }
  }

  await storeExtraction({
    documentId: input.documentId,
    extraction,
    docType,
    corrections,
  });

  if (['CAPITAL_CALL', 'DISTRIBUTION'].includes(docType)) {
    await persistCapitalEvents({
      documentId: input.documentId,
      extraction,
    });
  }
}
