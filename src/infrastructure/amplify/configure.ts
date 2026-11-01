import { Amplify } from 'aws-amplify';

type AmplifyOutputs = Parameters<typeof Amplify.configure>[0];

const outputsModules = import.meta.glob<AmplifyOutputs>('../../../amplify_outputs.json', {
  eager: true,
  import: 'default',
});

export function configureAmplify(): boolean {
  const outputs = Object.values(outputsModules)[0];
  if (!outputs || import.meta.env.VITE_DATA_SOURCE === 'local') return false;
  Amplify.configure(outputs);
  return true;
}
