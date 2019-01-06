import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibsModule } from '../libs/libs.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    LibsModule,
    HttpClientModule
  ],
  exports: [CommonModule, LibsModule],
  providers: [], // add services here
  declarations: [], // add components here
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  entryComponents: [] // add entry level components here
})
export class CoreModule { }
