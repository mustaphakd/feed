import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as srch from '../../core/models/searchFeedForm';
import {} from '../../core/models/searchFeed';
import * as mfd2 from './feedEndpointValidator';
import { FormBuilder, AsyncValidator, FormGroup, FormControl, Validators } from '@angular/forms';
import { isStringEmpty, logMessage } from 'src/app/core/shared/helper';
import { validateStringNotEmpty } from 'src/app/core/shared/types';
import { ModHttpService } from 'src/app/core/services/mod-http.service';

const logMessagePrefix = 'search-feed.component::';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'search-feed',
  templateUrl: './search-feed.component.html',
  styleUrls: ['./search-feed.component.css']
})
export class SearchFeedComponent implements OnInit {
  private form_: srch.modFeed.SearchFeedForm = null;

  public hiddenForm: FormGroup = null;

  @Output() urlSaved = new EventEmitter<string>();

  constructor(private formBuilder: FormBuilder, private modHttpClient: ModHttpService) {

    const feedValidator: AsyncValidator = new mfd2.modFeed.FeedEndpointValidator(this.modHttpClient);
    this.form_ =  new srch.modFeed.SearchFeedForm(
      this.formBuilder,
      [async (control) => {
        logMessage(logMessagePrefix + 'constructor() - SearchFeedForm-Validator callback being invoked.');
        const result = await feedValidator.validate(control);
        return result;
      }]);
    logMessage(this.form_);
   }

  ngOnInit() {
    logMessage(logMessagePrefix + 'ngOnInit() -  this.form_construced');

  }

  public get isValid(): boolean {
    logMessage(logMessagePrefix + 'isValid() - ');
    return this.formEntry.valid;
  }

  public get isInvalid(): boolean {
    logMessage(logMessagePrefix + 'isInvalid() - ');
    return this.formEntry.invalid && this.formEntry.touched;
  }

  public get IsSaveEnabled(): boolean {
    logMessage(logMessagePrefix + 'IsSaveEnabled() - ');
    return (! isStringEmpty(this.value)) && ! this.formEntry.invalid ;
  }

  public get formEntry(): FormGroup {
    logMessage(logMessagePrefix + 'formEntry() - Start');
    logMessage(this.form_);
    logMessage(logMessagePrefix + 'formEntry() - End');
    return this.form_.searchForm;
  }

  public get value(): string {
    logMessage(logMessagePrefix + 'value() - Start');
    logMessage(this.form_.searchEntry.value);
    logMessage(logMessagePrefix + 'value() - End');
    return this.form_.searchEntry.value;
  }

  public saveUrl(url: string): void {
    logMessage(logMessagePrefix + 'saveUrl() - Start');
    logMessage(url);
    validateStringNotEmpty(url);
    this.urlSaved.emit(url);
    logMessage(logMessagePrefix + 'saveUrl() - End');
  }

}
