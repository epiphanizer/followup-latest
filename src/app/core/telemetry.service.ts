import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { environment } from '@env/environment';

import { Logger } from './logger.service';

const log = new Logger('TelemetryService');

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
    if (!appInsightsConfig || !appInsightsConfig.enabled || !appInsightsConfig.connectionString) {
      return;
    }

    this.appInsights = new ApplicationInsights({
      config: {
        connectionString: appInsightsConfig.connectionString,
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
