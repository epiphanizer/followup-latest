import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { environment } from '@env/environment';

import { Logger } from './logger.service';

const log = new Logger('TelemetryService');

function isValidConnectionString(value: string) {
  return /(^|;)\s*InstrumentationKey\s*=\s*[^;]+/i.test(value);
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private appInsights: ApplicationInsights | null = null;
  private initialized = false;

  initialize() {
    if (this.initialized) {
      return;
    }

    const appInsightsConfig = environment.applicationInsights;
    const connectionString = appInsightsConfig?.connectionString?.trim() || '';

    if (!appInsightsConfig || !appInsightsConfig.enabled || !connectionString) {
      return;
    }

    if (!isValidConnectionString(connectionString)) {
      log.warn('Skipping Application Insights telemetry because the configured connection string is invalid.');
      return;
    }

    try {
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString,
          enableAutoRouteTracking: false,
          disableFetchTracking: false,
          disableAjaxTracking: false,
          enableUnhandledPromiseRejectionTracking: true,
          disableInstrumentationKeyValidation: true
        }
      });

      this.appInsights.loadAppInsights();
      this.appInsights.addTelemetryInitializer(envelope => {
        envelope.tags = envelope.tags || [];
        envelope.tags['ai.cloud.role'] = 'followup-frontend';
        envelope.tags['ai.application.ver'] = environment.version;
      });

      this.initialized = true;
      this.trackEvent('frontend_telemetry_initialized');
      log.info('Application Insights telemetry initialized.');
    } catch (error) {
      this.appInsights = null;
      log.warn('Skipping Application Insights telemetry because initialization failed.', error);
    }
  }

  trackPageView(path: string) {
    if (!this.appInsights) {
      return;
    }

    this.appInsights.trackPageView({
      name: path,
      uri: path
    });
  }

  trackException(error: any, properties?: { [key: string]: any }) {
    if (!this.appInsights) {
      return;
    }

    const exception = error instanceof Error ? error : new Error(String(error));
    this.appInsights.trackException({
      exception,
      properties
    });
  }

  trackEvent(name: string, properties?: { [key: string]: any }) {
    if (!this.appInsights) {
      return;
    }

    this.appInsights.trackEvent(
      {
        name
      },
      properties
    );
  }
}
