import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, MetaReducer } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { sessionReducer } from './core/store/session/session.reducer';
import { sessionHydrationMetaReducer } from './core/store/session/session.meta-reducer';
import * as sessionEffects from './core/store/session/session.effects';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';

const metaReducers: MetaReducer<any>[] = [sessionHydrationMetaReducer as MetaReducer<any>];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideAnimationsAsync(),
    provideStore({ session: sessionReducer }, { metaReducers }),
    provideEffects(sessionEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
  ],
};
