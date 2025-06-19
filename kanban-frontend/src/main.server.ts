import 'zone.js/node';
import { renderApplication } from '@angular/platform-server';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationRef } from '@angular/core';

export default function render(url: string, document: string): Promise<string> {
  return renderApplication(() => bootstrapApplication(App, appConfig), {
    document,
    url,
  });
}