import { Injectable } from '@angular/core';
import { FeedStorageService } from './feed-storage.service';
import { Observable, Subject } from 'rxjs';
import { RssChannel, FeedItem, isDefined, validateNotNull } from '../shared/types';
import { logMessage, validateStringNotEmpty } from '../shared/helper';
import { ModHttpService } from './mod-http.service';
import { modFeed } from '../models/feed';
import * as trnfmr from '../shared/feedTransformer';
import * as xmlJs from 'xml2js';
import * as prsr from '../../core/shared/feedParser';
import { ConnectionService } from 'ng-connection-service';


const logMessagePrefix = 'core-module::services::FeedManagerService::';

@Injectable({
  providedIn: 'root'
})
export class FeedManagerService {

  private initialized_: boolean;
  private rssChannelsSubject: Subject<RssChannel>;
  private rssChannelObserver$: Observable<RssChannel> = null;
  connectionStatus: CONNECTION_STATUS = CONNECTION_STATUS.ONLINE;
  isConnected = true;

  constructor(
    private readonly feedStorage: FeedStorageService,
    private readonly modHttpClient: ModHttpService,
    private readonly connectionService: ConnectionService ) {

    this.initialized_ = false;
    // instantiate the different observable
    this.rssChannelsSubject = new Subject<RssChannel>();

    if (this.rssChannelObserver$ === null) {
      this.rssChannelObserver$ = this.rssChannelsSubject.asObservable();
    }

    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        logMessage(logMessagePrefix + 'connectionService.monitor() -- online status changed: now ONLINE ');
        this.connectionStatus = CONNECTION_STATUS.ONLINE;
        this.runSynchronizationJob(true);
      } else {
        logMessage(logMessagePrefix + 'connectionService.monitor() -- online status changed: now OFFLINE ');
        this.connectionStatus = CONNECTION_STATUS.OFFLINE;
      }
    });
  }

  public getObservableRssChannels(): Observable<RssChannel> {
    logMessage(logMessagePrefix + 'observableRssChannels() - Start - ');
    this.startInitialization();
    logMessage(logMessagePrefix + 'observableRssChannels() - rssChannelObserver:  ');
    logMessage(this.rssChannelObserver$);
    logMessage(logMessagePrefix + 'observableRssChannels() - END - ');
    return this.rssChannelObserver$;
  }

  public refresh(): void {
    // 1 and 2 from initialize of the web worker
  }

  public removeChannel(rssChannel: RssChannel): void {
    logMessage(logMessagePrefix + 'removeChannel() - Start - rssChannel: ');
    logMessage(rssChannel);
    validateNotNull(rssChannel);
    const itemExist = this.feedStorage.doesItemExist(rssChannel.link);

    // tslint:disable-next-line:no-debugger
    debugger;
    if (! itemExist) {
      return;
    }

    const remove = new FeedItem(rssChannel.link);
    this.feedStorage.remove(remove);
    this.feedStorage.trackRemoval(remove);
    // this.runSynchronizationJob(true);
    this.performRequiredUpdate();

    logMessage(logMessagePrefix + 'removeChannel() - End - ');
  }

  public addChannel(url: string): void {
    logMessage(logMessagePrefix + 'addChannel() - Start - url: ');
    logMessage(url);
    validateStringNotEmpty(url);
    const itemExist = this.feedStorage.doesItemExist(url);

    if (itemExist) {
      return;
    }

    this.feedStorage.trackAddition(new FeedItem(url));
    // this.runSynchronizationJob(true);
    this.performRequiredUpdate();
    logMessage(logMessagePrefix + 'addChannel() - End - ');
  }


  private startInitialization(): void {
    logMessage(logMessagePrefix + 'startInitialization() - Start - ');

    const timeoutToken = setTimeout(
      (thisCache: FeedManagerService) => {
        logMessage(logMessagePrefix +
          'startInitialization() - setTimeout callback - Start - thisCache[[should be FeedManagerService]]: token: ');
        logMessage(thisCache);
        logMessage(timeoutToken);
        clearTimeout(timeoutToken);
        thisCache.initialize();
        logMessage(logMessagePrefix + 'startInitialization() - setTImeout callback- END - ');
      },
      200,
      this);
    logMessage(logMessagePrefix + 'startInitialization() - timeoutToken - ');
    logMessage(timeoutToken);
    logMessage(logMessagePrefix + 'startInitialization() - END - ');
  }

  private performRequiredUpdate() {
    logMessage(logMessagePrefix + 'performRequiredUpdate() - Start - ');
    this.initialize(true);
    logMessage(logMessagePrefix + 'performRequiredUpdate() - End - ');
  }

  private initialize(isUpdateOperation: boolean = false): void {
    logMessage(logMessagePrefix + 'initialize() - Start - ');
    if (this.initialized_ === true && isUpdateOperation === false) {
      logMessage(logMessagePrefix + 'initialize() - Already initialized - _-Returning ');
      return;
    }

    // check local cache first
    const feedItems = this.feedStorage.feedItems;
    const feedItemsLength = feedItems.length;
    logMessage(logMessagePrefix + 'initialize() - feedITems - ');
    logMessage(feedItems);

    if (feedItemsLength < 1 && isUpdateOperation === false) {
      // fetch from remote
      this.fetchRemoteFeedItems().then((items: Array<FeedItem>) => {
        logMessage(logMessagePrefix + 'initialize()::fetchRemoteFeedItems()Callback -- Start - items: ');
        logMessage(items);
        // tslint:disable-next-line:no-debugger
        debugger;
        // preload cache
        this.runSynchronizationJob(false, items);
        this.runChannelsRetrievingJob();
        logMessage(logMessagePrefix + 'initialize()::fetchRemoteFeedItems()Callback -- END - ');
      });
    } else {
        this.runSynchronizationJob(true);
        this.runChannelsRetrievingJob();
    }

    logMessage(logMessagePrefix + 'initialize() - END - ');
  }

  private async fetchRemoteFeedItems(): Promise<Array<FeedItem>> {
    logMessage(logMessagePrefix + 'fetchRemoteFeedItems -- Start - ');
    const thisCache = this;
    const promise = new Promise<Array<FeedItem>>((resolve, reject) => {
      thisCache.modHttpClient.getFeeds()
                             .subscribe({
                               next: data => {
                                logMessage(logMessagePrefix + 'fetchRemoteFeedItems:::modHttpClient.getFeeds::next()Callback -- Start - ');
                                 const feedItems = trnfmr.modFeed.FeedTransformer.fromFeedsToFeedItems(data);
                                 logMessage(feedItems);
                                 logMessage(logMessagePrefix + 'fetchRemoteFeedItems:::modHttpClient.getFeeds::next()Callback -- END - ');
                                 resolve(feedItems);
                               }
                             });
    });

    logMessage(logMessagePrefix + 'fetchRemoteFeedItems -- END - ');
    return promise;
  }

  // candidate for web worker
  private runSynchronizationJob(syncWithRemote: boolean = false, feedItems: Array<FeedItem> = null): void {
    logMessage(logMessagePrefix + 'runSynchronizationJob -- Start - feedItems: ');
    logMessage(feedItems);
    // latest retrieved from remote should be stored in cache

    if (isDefined(feedItems)) {
      logMessage(logMessagePrefix + 'runSynchronizationJob -- preloadCache: ');
      // tslint:disable-next-line:no-debugger
      debugger;
      this.feedStorage.preloadCache(feedItems);
    }

    if (false === syncWithRemote) {
      logMessage(logMessagePrefix + 'runSynchronizationJob -- synch with remote not necessary. -_- returning ');
      return;
    }

    // todo: check with storage service or this service to determine if synchronization is needed

    // send tracked operations to remote //for now keep it simple and just push all addition and non-removed
    const validFeedItems = this.feedStorage.feedItems;
    const feeds = trnfmr.modFeed.FeedTransformer.fromFeedItemsToFeeds(validFeedItems);
    const thisCache = this;
    // tslint:disable-next-line:no-debugger
    debugger;
    this.modHttpClient.saveFeeds(feeds)
                      .subscribe({
                        next: obj => {
                          logMessage(logMessagePrefix + 'runSynchronizationJob:::modHttpClient.saveFeeds::next()Callback -- Start - END');
                        },
                        complete: () => {
                          logMessage(
                            logMessagePrefix + 'runSynchronizationJob:::modHttpClient.saveFeeds::complete()Callback -- Start - END');
                            thisCache.fetchRemoteFeedItems();
                        }
                      });

    logMessage(logMessagePrefix + 'runSynchronizationJob -- END - ');
  }

    // candidate for web worker
  private runChannelsRetrievingJob(): void {
    logMessage(logMessagePrefix + 'runChannelsRetrievingJob -- Start - ');

    const feedItems = this.feedStorage.feedItems;
    const feedItemsLength = feedItems.length;
    const thisCache = this;
    const urls = new Array<string>();

    for (let i = 0; i < feedItemsLength; i++) {
      const feedItem = feedItems[i];
      const url = feedItem.url;
      urls.push(url);
      logMessage(logMessagePrefix + 'runChannelsRetrievingJob -- iteration [[' + i + ']] - url: [[' + url + ']] ');
    }

    if (urls.length < 1) {
      logMessage(logMessagePrefix + 'runChannelsRetrievingJob -- END - Early exit. ');
      return;
    }

    this.modHttpClient.addExternalRequest(...urls);

    const token = this.modHttpClient.getDataArrived()
                        .subscribe({
                          next: (result) => {
                            logMessage(logMessagePrefix +
                              'runChannelsRetrievingJob():: modHttpClient::getDataArrived callback' +
                               ' -- iteration [[' + 0 + ']] - url: [[' + 0 + ']] ');
                               logMessage(result);

                            thisCache.parseRssXmlDoc(
                              result.data, result.url,
                              (feedChannel) => {
                                if ( isDefined(feedChannel)) {
                                  thisCache.rssChannelsSubject.next(feedChannel);
                                }
                            });
                          },
                          complete: () => token()
                        });

    logMessage(logMessagePrefix + 'runChannelsRetrievingJob -- modHttpClient.beginDataRetrival - ');
    this.modHttpClient.beginDataRetrival();
    logMessage(logMessagePrefix + 'runChannelsRetrievingJob -- END - ');
  }


  private parseRssXmlDoc(data: string, defaultUrl: string, callback: (channel: RssChannel) => void): void {
    logMessage(logMessagePrefix + 'parseRssXmlDoc -- Start - data:');
    logMessage(data);
    validateStringNotEmpty(data);
    xmlJs.parseString(
      data,
      (err, result) => {
        logMessage(logMessagePrefix + 'parseRssXmlDoc -  xmlJs.parseString callback- Start - ');
        logMessage(err);
        logMessage(result);

        if (err) {
          logMessage(logMessagePrefix + 'parseRssXmlDoc -  xmlJs.parseString callback- xml2Js parsestrring error **************');
          return;
        }

        let channel: RssChannel = null;

        try {
          logMessage(logMessagePrefix + 'parseRssXmlDoc -  xmlJs.parseString callback- Invokking feedParser Start : ');
          const parser = new prsr.modCreate.FeedParser();
          logMessage(parser);
          channel = parser.parseRss(result, defaultUrl);
          logMessage(logMessagePrefix + 'parseRssXmlDoc -  xmlJs.parseString callback-   xmlJs.parseString callback- End - ');
        } catch (ex) {}

        callback(channel);

      });
    logMessage(logMessagePrefix + 'parseRssXmlDoc -- END - ');
  }
}

export enum CONNECTION_STATUS {
  ONLINE = 'online',
  OFFLINE = 'offline'
}
