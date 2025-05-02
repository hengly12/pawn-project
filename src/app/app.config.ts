import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { environment } from '../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideLottieOptions } from 'ngx-lottie';
import { MatNativeDateModule } from '@angular/material/core';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getStorage, provideStorage } from '@angular/fire/storage';



function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const provideTranslation = () => ({
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
});

export const createCustomPrefixRoutes = (translate: TranslateService) => {
  translate.addLangs(['en', 'km', 'zh']);
  translate.setDefaultLang('km');
  const browserLang = translate.getBrowserLang();
  translate.use(browserLang?.match(/en|zh/) ? browserLang : 'km');
  return translate.currentLang;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    importProvidersFrom([TranslateModule.forRoot(provideTranslation())]),
    // {
    //   provide: APP_BASE_HREF,
    //   // useValue: '/km',
    //   useFactory: createCustomPrefixRoutes,
    //   deps: [TranslateService],
    // },
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimationsAsync(),
    provideClientHydration(),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    provideFunctions(() => getFunctions(getApp(), 'asia-east2')),
    importProvidersFrom(MatNativeDateModule),
    provideEnvironmentNgxMask(), provideFirebaseApp(() => initializeApp({ projectId: "test-41575", appId: "1:414904774090:web:402f56ddbf5354c5a5b333", storageBucket: "test-41575.appspot.com", apiKey: "AIzaSyDjqSzLepHQCI6Isf0LLxrn2-6ajsO93lg", authDomain: "test-41575.firebaseapp.com", messagingSenderId: "414904774090" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideAnimationsAsync(), provideAnimationsAsync(),
  ],
};
