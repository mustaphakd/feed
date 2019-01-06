import { async, ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { sendInput } from '../../testHelper';

import { SearchFeedComponent } from './search-feed.component';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs/internal/observable/of';
import { FormBuilder, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LibsModule } from 'src/app/libs/libs.module';
import { CoreModule } from 'src/app/core/core.module';
import { ComponentsModule } from '../components.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { logMessage, validateNotNull, validateStringNotEmpty } from 'src/app/core/shared/helper';

const testTitle = 'search-feed.component.spec.ts -- ';
const validRssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
  <title>W3Schools Home Page</title>
  <link>https://www.w3schools.com</link>
  <description>Free web building tutorials</description>
  <item>
    <title>RSS Tutorial</title>
    <link>https://www.w3schools.com/xml/xml_rss.asp</link>
    <description>New RSS tutorial on W3Schools</description>
  </item>
  <item>
    <title>RSS Tutorial IIII</title>
    <link>https://www.w3schools.com/xml/xml_rss.asp</link>
    <description>New RSS tutorial on W3Schools</description>
  </item>
</channel>

</rss>`;

const invalidRssFeed = 'vadaf adafad';


describe('SearchFeedComponent', () => {
  let component: SearchFeedComponent;
  let fixture: ComponentFixture<SearchFeedComponent>;
  const httpClientService = jasmine.createSpyObj('HttpClient', ['get']);
  const formBuild: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFeedComponent ],
      imports : [
        CoreModule,
        NoopAnimationsModule
      ],
      providers: [
        {provide: HttpClient, useValue: httpClientService},
        {provide: FormBuilder, useValue: formBuild}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.whenStable();
  });


  function locateElementFromRoot<T extends HTMLElement>(cssLocator: string): T {
    logMessage('search-feed.component.spec:: locateElementFromRoot() - Start');
    const root  = fixture.debugElement;
    const elementDe = root.query(By.css(cssLocator));
    const element: T = elementDe.nativeElement;
    logMessage(element);
    logMessage('search-feed.component.spec:: locateElementFromRoot() - END');
    return element;
  }

  function validateSaveButtonDisabled(expectedState: boolean): void {
    console.log('search-feed.component.spec:: validateSaveButtonDisabled: ' + expectedState);
    const saveBtnELementDe = fixture.debugElement.query(By.css('[data-test-id="feed-search-save-btn-container"]'));
    const saveBtnClasses = saveBtnELementDe.classes;
    const disabledClass = saveBtnClasses.disabled;
    console.dir(disabledClass);

    if (expectedState === true) {
      expect(disabledClass).toBeTruthy();
    } else {
      expect(disabledClass).toBeFalsy();
    }
  }

  it('should recognize valid feed', fakeAsync (() => {
      component.ngOnInit();
      flushMicrotasks();

      const root  = fixture.debugElement;
      logMessage('search-feed.component.spec:: testTitle, root, component::');
      logMessage(testTitle);
      logMessage(root);
      logMessage(component);

      const inputElement: HTMLInputElement = locateElementFromRoot('input[data-test-id="root-feed-search-input"]');
      const v = httpClientService.get.and.returnValue(of(validRssFeed));

      // we expect the save button to be disabled initialy
      validateSaveButtonDisabled(true);

      sendInput('http://myfeed.com/ads', inputElement, fixture).then(() => {
        logMessage('search-feed.component.spec::sendInput-CallBack');
        logMessage(inputElement.value);
        logMessage(inputElement['value']);
        expect(component.isValid).toBeTruthy();
        expect(component.isInvalid).toBeFalsy();
        validateSaveButtonDisabled(false);
       });
  }));

  it('should recognize inValid feed', fakeAsync(() => {
     expect(component).toBeTruthy();
     component.ngOnInit();
     flushMicrotasks();

    const inputElement: HTMLInputElement = locateElementFromRoot('input[data-test-id="root-feed-search-input"]');
    httpClientService.get.and.returnValue(of(invalidRssFeed));
    // we expect the save button to be disabled initialy
    validateSaveButtonDisabled(true);

    sendInput('http://myfeed.com/ads', inputElement, fixture).then(() => {
      expect(component.formEntry.invalid).toBeTruthy();
      expect(component.isValid).toBeFalsy();
      validateSaveButtonDisabled(true);
    });
  }));
});
