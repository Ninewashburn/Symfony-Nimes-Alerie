import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { installMaterialSymbolsFallback } from './app/core/utils/material-symbols-fallback';

installMaterialSymbolsFallback();
bootstrapApplication(AppComponent, appConfig).catch((err: unknown) => {
  setTimeout(() => {
    throw err;
  });
});
