import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideRouter,
  withViewTransitions
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';

import {
  loadingInterceptor
} from './core/http/loading.interceptor';

import {
  authInterceptor
} from './interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {

  providers: [

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(
      routes,
      withViewTransitions()
    ),

    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        authInterceptor
      ])
    )

  ]
};