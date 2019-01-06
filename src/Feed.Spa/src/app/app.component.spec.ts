import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LibsModule } from './libs/libs.module';
import { CoreModule } from './core/core.module';
import { ComponentsModule } from './components/components.module';
import { AppModule } from './app.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { debug } from 'util';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';
describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent> = null;
  let app: AppComponent = null;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports : [
        ComponentsModule,
        NoopAnimationsModule,
        CoreModule
      ],
      providers: [{provide: ComponentFixtureAutoDetect, useValue: true}]
    }).compileComponents();
  }));

  beforeEach((() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
  }));

  it('should create the app', async(() => {
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'feedSpa'`, async(() => {
    expect(app.title).toEqual('feedSpa');
  }));
  it('should render title in a h1 tag', async(() => {
    console.dir(fixture);
    // fixture.autoDetectChanges(true);
    console.log('accessing the debug element');
    console.dir(fixture.debugElement);
    const compiled: HTMLElement = fixture.debugElement.nativeElement;
    console.dir(compiled);
    fixture.whenStable();
    fixture.whenRenderingDone();
    console.dir(app.title);
    compiled.dispatchEvent(new Event('changedValue'));
    const header = compiled.querySelector('[data-test-id="entryHeader"]');
    console.dir(fixture.debugElement.nativeNode);
    // fixture.detectChanges();
    // fixture.changeDetectorRef.detectChanges();
    console.debug(header);
    expect(header.textContent).toContain('Welcome to feedSpa!');
  }));
});
