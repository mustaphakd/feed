import { ComponentFixture, tick, flush, flushMicrotasks } from '@angular/core/testing';
// import { tick } from '@angular/core/src/render3/instructions';

// https://stackoverflow.com/questions/39582707/updating-input-html-field-from-within-an-angular-2-test

// https://blog.nrwl.io/controlling-time-with-zone-js-and-fakeasync-f0002dfbf48c

export async function sendInput(text: string, inputControl: HTMLInputElement, fixture: ComponentFixture<any>): Promise<void> {

    console.log('testInput::sendInput- Start');
    inputControl['value'] = text;
    console.dir(inputControl);
    inputControl.dispatchEvent(new Event('input'));

    tick(100);
    flushMicrotasks();
    fixture.detectChanges();
    console.log('testInput::sendInput-value after ticks');
    console.log(inputControl.value);
    console.log(inputControl['value']);

    fixture.whenStable();
    console.dir(inputControl);
    console.log('testInput::sendInput- END');
}
