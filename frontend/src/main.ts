/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app-module';

// Import explicite de Zone.js pour la détection de changements
import 'zone.js';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
