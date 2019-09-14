import { injectable } from 'inversify';

@injectable()
export class SimulatableAppGenerator {
  generateFor(
    resourceId: string,
    options: {
      filePath: string;
      port: string;
      repeatInterval?: string;
    }
  ) {
    return {};
  }
}
