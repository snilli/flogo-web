import { config } from '../../../config';

export function resolveFlowRunnerEnv() {
  const settings = config.buildEngine.config.services || [];
  const stateRecorder = settings.find(service => service.name === 'stateRecorder');
  const engineTester = settings.find(service => service.name === 'engineTester');
  const { host: stateHost, port: statePort } = stateRecorder.settings;
  const env = {
    TESTER_ENABLED: 'true',
    TESTER_PORT: engineTester.settings.port,
    TESTER_SR_SERVER: `${stateHost}:${statePort}`,
  };
  return env;
}
