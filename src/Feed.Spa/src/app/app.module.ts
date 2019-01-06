import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { LibsModule } from './libs/libs.module';
import { ComponentsModule } from './components/components.module';
// import { SearchFeedComponent } from './components/search-feed/search-feed.component';
// import { ChannelsTreeComponent } from './components/channels-tree/channels-tree.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LibsModule,
    CoreModule,
    ComponentsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }
