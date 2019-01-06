import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatGridListModule, MatCardModule, MatButtonModule, MatCheckboxModule, MatListModule,
        MatSelectModule, MatPseudoCheckboxModule, MatInputModule, MatRadioModule, MatFormFieldModule,
        MatSortModule, MatOptionModule, MatDatepickerModule, MatButtonToggleModule, MatPaginatorModule,
        MatProgressSpinnerModule, MatNativeDateModule,
        MatIconModule, MatTableModule, MatTooltipModule, MatSnackBarModule, MatDialogModule,
        MatTreeModule, MatRippleModule} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

const moudules = [
  HttpClientModule,
  FormsModule,
  ReactiveFormsModule,
  MatIconModule,
  MatCheckboxModule,
  MatButtonModule,
  MatGridListModule,
  MatCardModule,
  MatListModule,
  MatIconModule,
  MatTableModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDialogModule,
  MatSelectModule, MatPseudoCheckboxModule, MatInputModule, MatRadioModule, MatFormFieldModule,
  MatSortModule, MatOptionModule, MatDatepickerModule, MatButtonToggleModule, MatPaginatorModule,
  MatProgressSpinnerModule, MatNativeDateModule, MatTreeModule, MatRippleModule
];


@NgModule({
  imports: moudules,
  exports: moudules,
  declarations: []
})
export class LibsModule { }
