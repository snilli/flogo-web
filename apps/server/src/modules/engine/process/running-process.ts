import { ExecaChildProcess } from 'execa';

export type RunningProcess = ExecaChildProcess & {
  closed?: boolean;
  whenClosed: Promise<void>;
};
