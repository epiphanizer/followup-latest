import { environment } from '@env/environment';

import { Logger } from './logger.service';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  const savedApplicationInsights = { ...environment.applicationInsights };
  let savedLevel: number;

  beforeAll(() => {
    savedLevel = Logger.level;
    Logger.enableProductionMode();
  });

  beforeEach(() => {
    environment.applicationInsights.enabled = true;
    environment.applicationInsights.connectionString = '';
  });

  afterAll(() => {
    environment.applicationInsights.enabled = savedApplicationInsights.enabled;
    environment.applicationInsights.connectionString = savedApplicationInsights.connectionString;
    Logger.level = savedLevel;
  });

  it('should ignore malformed telemetry configuration without throwing', () => {
    environment.applicationInsights.connectionString = '27cc1722-4e9f-4421-ac76-888428f95892';

    const service = new TelemetryService();

    expect(() => service.initialize()).not.toThrow();
  });
});