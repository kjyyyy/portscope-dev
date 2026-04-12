import { Worker } from '@temporalio/worker';

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities: require('./activities'),
    taskQueue: 'portscope-ingest',
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'portscope',
  });

  console.log('Portscope Temporal worker started');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
