import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { logMessage, validateNotNull, validateStringNotEmpty } from 'src/app/core/shared/helper';
import { isDefined } from '@angular/compiler/src/util';


const logMessagePrefix = 'components-module::FrameHostComponent::';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frame-host',
  templateUrl: './frame-host.component.html',
  styleUrls: ['./frame-host.component.css']
})
export class FrameHostComponent {

    @ViewChild('iFrameElement') iFrameElement: ElementRef;

    @Input()
    public set frameUrl(value: string) {
        logMessage(logMessagePrefix + ' -Start - value: ');
        logMessage(value);
        logMessage(this.iFrameElement);
        logMessage(this.iFrameElement.nativeElement);

        const src = this.iFrameElement.nativeElement['src'];

        if (src === value) {
            return;
        }

        this.iFrameElement.nativeElement['src'] = value;

        const parentElement = this.iFrameElement.nativeElement['parentElement'];
        let pane = parentElement['parentElement'];

        if (! isDefined(parentElement) || ! isDefined(pane)) {
            return;
        }

        logMessage(parentElement);
        logMessage(pane);
        const thisCache = this;

        const  token = setTimeout(() => {
            clearTimeout(token);
            const dom = window.document;
            logMessage(dom);

            if (! isDefined(dom)) {
              return;
            }
            pane = dom.getElementById(pane['id']);

            parentElement.style.width = pane.clientWidth + 'px';
            parentElement.style.height =  pane.clientHeight + 'px';
            thisCache.iFrameElement.nativeElement.style.width = pane.clientWidth + 'px';
            this.iFrameElement.nativeElement.style.height = pane.clientHeight + 'px';

            pane.style['overflow'] = 'hidden';
        }, 20);

        logMessage(logMessagePrefix + ' - END ');
    }
}
