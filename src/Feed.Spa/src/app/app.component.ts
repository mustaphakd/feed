import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { logMessage, isDefined } from './core/shared/helper';
import { RssChannelItem, validateNotNull, RssChannel, isStringEmpty, validateStringNotEmpty } from './core/shared/types';
import { FeedManagerService } from './core/services/feed-manager.service';
import { DomSanitizer} from '@angular/platform-browser';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public title_: string = null;
  private readingView_ = 'newspaper';
  private firstRssChannelItem_: RssChannelItem;
  private secondRssChannelItem_: RssChannelItem;
  private thirdRssChannelItem_: RssChannelItem;
  private rssChannel_: RssChannel;

  private backendPoint_: string;

  constructor(
    private readonly feedsManager: FeedManagerService,
    private sanitizer: DomSanitizer,
    private readonly settings: SettingsService) {
    this.backendPoint_ = window['backendPoint'];
    this.settings.backendEndpoint = this.backendPoint_;
  }

  ngOnInit(): void {
    this.title_ = 'feedSpa';
  }

  public get title(): string {
    return this.title_;
  }

  public set readingView(value: string) {
    this.readingView_ = value;
  }

  public get readingView(): string {
    return this.readingView_;
  }

  public get firstRssChannelItem(): RssChannelItem {
    return this.firstRssChannelItem_;
  }

  public get secondRssChannelItem(): RssChannelItem {
    return this.secondRssChannelItem_;
  }

  public get thirdRssChannelItem(): RssChannelItem {
    return this.thirdRssChannelItem_;
  }


  public get firstRssChannelItemLink(): any {
    const url = isDefined(this.firstRssChannelItem_) ?
          this.settings.feedApiHTMLEndpoint + '?url=' + this.firstRssChannelItem_.link : '';
    return url; // this.sanitizer.bypassSecurityTrustResourceUrl(url).toString();
  }

  public get secondRssChannelItemLink(): any {
    const  url =  isDefined(this.secondRssChannelItem_) ?
          this.settings.feedApiHTMLEndpoint + '?url=' + this.secondRssChannelItem_.link : '';
    return url; // this.sanitizer.bypassSecurityTrustResourceUrl(url).toString();
  }

  public get thirdRssChannelItemLink(): any {
    const url = isDefined(this.thirdRssChannelItem_) ?
          this.settings.feedApiHTMLEndpoint + '?url=' + this.thirdRssChannelItem_.link : '';
    return url;  // this.sanitizer.bypassSecurityTrustResourceUrl(url).toString();
  }

  public get rssChannel(): RssChannel {
    return this.rssChannel_;
  }

  public rssChannelItemSelected(rssChannelItem: RssChannelItem): void {
    logMessage('app.component::rssChannelItemSelected() -Start - rssChannelItem: ');
    logMessage(rssChannelItem);
    validateNotNull(rssChannelItem);
    // validate and set rssChannelITem position
    if (! isDefined(this.rssChannel_)) {
      logMessage('app.component::rssChannelItemSelected() - rthis.rssChannel is not defined - ');
      this.firstRssChannelItem_ = rssChannelItem;
      this.rssChannel_ = rssChannelItem.parent;
    }

    logMessage('app.component::rssChannelItemSelected() - calling setFirstChannelItem - ');
    this.setFirstChannelItem(rssChannelItem);

    logMessage('app.component::rssChannelItemSelected() -End - ');
  }

  public rssChannelSelected(rssChannel: RssChannel): void {
    logMessage('app.component::rssChannelSelected() -Start - rssChannel: ');
    logMessage(rssChannel);
    validateNotNull(rssChannel);

    logMessage('app.component::rssChannelSelected() - calling setChannel - ');
    this.setChannel(rssChannel);

    logMessage('app.component::rssChannelSelected() -End - ');
  }

  public saveUrl(url: string): void {
    logMessage('app.component::saveUrl() -Start - url: ');
    logMessage(url);
    validateStringNotEmpty(url);
    // tslint:disable-next-line:no-debugger
    debugger;
    this.feedsManager.addChannel(url);
    logMessage('app.component::saveUrl() - End - ');
  }

  @Input()
  public set backendPoint(value: string) {
    this.backendPoint_ = value;
  }

  public get backendPoint(): string {
    return this.backendPoint_;
  }


  // todo: this method will break from desktop app or mobile app
  // required to resize iframe for now
  public frameLoaded(elementId: string, paneId: string): void {
    logMessage('app.component::frameLoaded() -Start - elementId: ');
    logMessage(elementId);
    const dom = window.document;
    logMessage(dom);

    if (! isDefined(dom)) {
      return;
    }

    const element = dom.getElementById(elementId);
    logMessage(element);
    const panel = dom.getElementById(paneId);
    logMessage(panel);

    if (! isDefined(element) || ! isDefined(panel)) {
      return;
    }

    element.style.height =  panel.clientHeight + 'px';
    element.style.width = panel.clientWidth + 'px';
    // tslint:disable-next-line:no-debugger
   // debugger;
    logMessage('app.component::frameLoaded() - End - ');
   /* const rsc = element['src'];

    if (isStringEmpty(rsc)) {
      return;
    }

    element['src'] = rsc ;
    element['load'] = null;
    element['onload'] = null;

    element.outerHTML = element.outerHTML; */
  }


  private setChannel(rssChannel: RssChannel): void {
    logMessage('app.component::setChannel() -Start -rssChannel ');
    logMessage(rssChannel);
    validateNotNull(rssChannel);

    if (isDefined(this.rssChannel_)) {
      const currentUrl = this.rssChannel_.link;
      const channelUrl = rssChannel.link;

      if (currentUrl === channelUrl) {
        return;
      }
    }

    this.rssChannel_ = rssChannel;
    const items = this.rssChannel.items;
    const itemsLength = items.length;
    logMessage('app.component::setChannel() -Start -items ');
    logMessage(items);
    logMessage('app.component::setChannel() -Start -itemsLength ');
    logMessage(itemsLength);

    if (itemsLength < 1) {
      return;
    }

    this.firstRssChannelItem_ = items[0];

    if (itemsLength < 2) {
      return;
    }

    this.secondRssChannelItem_ = items[1];

    if (itemsLength < 3) {
      return;
    }

    this.thirdRssChannelItem_ = items[2];

    logMessage('app.component::setChannel() - End ');
  }

  private setFirstChannelItem(rssChannelItem: RssChannelItem): void {
    logMessage('app.component::setFirstChannelItem() -Start -rssChannelItem ');
    logMessage(rssChannelItem);
    const channelUrl = rssChannelItem.link.trim();
    let firstChannelUrl = isDefined(this.firstRssChannelItem)  ? this.firstRssChannelItem.link : '';
    let secondChannelUrl = isDefined(this.secondRssChannelItem)  ? this.secondRssChannelItem.link : '';
    let thirdChannelUrl = isDefined(this.thirdRssChannelItem)  ? this.thirdRssChannelItem.link : '';

    if (! isStringEmpty(firstChannelUrl)) {
      firstChannelUrl = firstChannelUrl.trim();
    }

    if (! isStringEmpty(secondChannelUrl)) {
      secondChannelUrl = secondChannelUrl.trim();
    }

    if (! isStringEmpty(thirdChannelUrl)) {
      thirdChannelUrl = thirdChannelUrl.trim();
    }

    if (channelUrl === firstChannelUrl) {
      return;
    }

    if (channelUrl === secondChannelUrl) {
      this.secondRssChannelItem_ = this.firstRssChannelItem;
    } else if (channelUrl === thirdChannelUrl) {
      this.thirdRssChannelItem_ = this.firstRssChannelItem;
    }

    this.firstRssChannelItem_ = rssChannelItem;

    logMessage('app.component::setFirstChannelItem() -END ');
  }
}
