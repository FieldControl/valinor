import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop'; // Import here

// ... other imports

@NgModule({
  // ...
  imports: [
    BrowserModule,
    // ... other imports
    DragDropModule, // Add DragDropModule to imports
  ],
  // ...
})
export class AppModule {}
