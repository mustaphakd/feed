import { Injectable } from '@angular/core';
import { HttpClient, HttpHandler, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import * as mdls from '../models/feed';
import { Observable, from, of, Subject, throwError } from 'rxjs';
import { logMessage, validateStringNotEmpty } from '../shared/helper';
import { validateNotNull, isStringEmpty } from '../shared/types';
import { isDefined } from '@angular/compiler/src/util';
import { SettingsService } from './settings.service';

// todo: crx cutting auth token refresh + flow for dsktop and mbile front end
const logMessagePrefix = 'core-module::services::ModHttpService::';

@Injectable({
  providedIn: 'root'
})
export class ModHttpService {

  private urlPrefix = '';
  private externalUrlsQueue = new Array<string>();
  private dataArrivedSubject: Subject<any>;
  private retrievingExternalData_ = false;
  private inFlightCachedToken_: any = null;

  constructor(private readonly httpClient: HttpClient, private readonly settings: SettingsService) {
    logMessage(logMessagePrefix + 'constructor() - ');

    this.mockedStore.push(new mdls.modFeed.Feed('https://www.yahoo.com/news/world/rss'));
    this.mockedStore.push(new mdls.modFeed.Feed('http://feeds.feedburner.com/WarNewsUpdates'));
    this.mockedStore.push(new mdls.modFeed.Feed('https://www.thecipherbrief.com/feed'));

    this.mockedStore.push(new mdls.modFeed.Feed('http://www.globalissues.org/news/feed'));
    this.mockedStore.push(new mdls.modFeed.Feed('http://www.e-ir.info/category/blogs/feed'));
    this.mockedStore.push(new mdls.modFeed.Feed('http://defence-blog.com/feed'));

    this.mockedStore.push(new mdls.modFeed.Feed('http://www.aljazeera.com/xml/rss/all.xml'));
    this.mockedStore.push(new mdls.modFeed.Feed('https://www.buzzfeed.com/world.xml'));
    this.mockedStore.push(new mdls.modFeed.Feed(
      'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/world/rss.xml'));

    this.mockedStore.push(new mdls.modFeed.Feed('https://news.google.com/news/rss/headlines/section/topic/WORLD?ned=us&hl=en'));
    this.mockedStore.push(new mdls.modFeed.Feed('http://feeds.bbci.co.uk/news/world/rss.xml'));
    this.mockedStore.push(new mdls.modFeed.Feed('https://www.reddit.com/r/worldnews/.rss'));
  }

  /*
    mock helper
  */
  private mockedStore: Array<mdls.modFeed.Feed> = new Array<mdls.modFeed.Feed>();




  // *******************************************

  public getFeeds(): Observable<Array<mdls.modFeed.Feed>> {
    logMessage(logMessagePrefix + 'getFeeds() - Start');
    // return mock object instead overhere
/*
    const observable = of(this.mockedStore);
    logMessage(observable);
    logMessage(logMessagePrefix + 'getFeeds() - END');
    return observable; */
    const  endpoint = this.settings.feedApiEndpoint;
    return this.sendRequest(HttpMethod.GET, '', null)
                .pipe(
                  map( item => {
                    const arr = (<Array<any>> item).map(val => new mdls.modFeed.Feed(val));
                    return arr;
                  })
                );
  }

  /**
   * @description bypass auth requirment requesting out of path data
   * @param url endpoint to retrieve data from
   */
  public getData(url: string): Observable<any> {
    logMessage(logMessagePrefix + 'getData() - Start');
    validateStringNotEmpty(url);
    const endpoint = this.settings.feedApiFetchEndpoint + '?url=' + url;
    logMessage(endpoint);
    logMessage(logMessagePrefix + 'getData() - End');
    return this.httpClient.get(
      endpoint,
      {
        headers:
          new HttpHeaders(
            {
              'Content-Type': 'text/xml',
              'X-Requested-With': 'XMLHttpRequest',
              'MyClientCert': '',        // This is empty
              'MyToken': ''              // This is empty
            }
          ),
        reportProgress: false,
        responseType: 'text'
      }).pipe( map(res => res), catchError(err => throwError(err)) );
  }

  public beginDataRetrival(): void {
    logMessage(logMessagePrefix + 'beginDataRetrival() - Start.  data is already being retrieved ??');
    logMessage(this.retrievingExternalData_);

    if (this.retrievingExternalData_ === true) {
      return;
    }

    this.retrievingExternalData_ = true;

    const thisCache = this;
    const timeoutToken = setTimeout(
      () => {
        logMessage(logMessagePrefix + 'beginDataRetrival() - setTimeout- Start');
        clearTimeout(timeoutToken);
        thisCache.runExternalDataRetrievalLoop();
        logMessage(logMessagePrefix + 'beginDataRetrival() - setTimeout- End');
      },
      200);

    logMessage(logMessagePrefix + 'beginDataRetrival() - End');
  }

  public getDataArrived(): Observable<any> {
    logMessage(logMessagePrefix + 'getDataArrived() - Start');

    if (! isDefined(this.dataArrivedSubject)) {
      logMessage(logMessagePrefix + 'getDataArrived() - this.dataArrivedSubject being initialized');
      this.dataArrivedSubject = new Subject<any>();
      logMessage(this.dataArrivedSubject);
    }

    const observable$ = this.dataArrivedSubject.asObservable();
    logMessage(logMessagePrefix + 'getDataArrived() - observable$ ');
    logMessage(observable$ );
    logMessage(logMessagePrefix + 'getDataArrived() - End');
    return observable$;
  }

  public addExternalRequest(...urls: string[]): void {
    logMessage(logMessagePrefix + 'addExternalRequest() - Start');
    logMessage(urls);
    validateNotNull(urls);
    const urlsLength = urls.length;

    for (let i = 0; i < urlsLength; i++) {
      let url = urls[i];

      if (isStringEmpty(url)) {
        continue;
      }

      url = url.trim();
      this.externalUrlsQueue.push(url);
    }

    logMessage(logMessagePrefix + 'addExternalRequest() - End');
  }

  public saveFeeds(feeds: Array<mdls.modFeed.Feed>) {
    logMessage(logMessagePrefix + 'saveFeeds() - Start');
    validateNotNull(feeds);
    const feedsUrl = feeds.map(feed => feed.Url);
    const thisCache = this;
    logMessage(logMessagePrefix + 'saveFeeds() - END');
    return this.sendRequest(HttpMethod.POST, '', feedsUrl );
  }

  private runExternalDataRetrievalLoop(): void {
    logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - Start - queue length');
    const queueLength = this.externalUrlsQueue.length;
    logMessage(queueLength);

    // tslint:disable-next-line:no-debugger
    // debugger;
    if (queueLength < 1) {
      logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - End - Early exit');
      this.retrievingExternalData_ = false;
      // ?todo:? this.dataArrivedSubject.complete();
      return;
    }

    const url = this.externalUrlsQueue.splice(0, 1)[0];
    validateStringNotEmpty(url);
    const thisCache = this;
// tslint:disable-next-line:no-debugger
debugger;
    this.inFlightCachedToken_ = this.getData(url)
        .subscribe({
          next: (data) => {
            logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - getData-subscribe-cb Start');
            thisCache.inFlightCachedToken_.unsubscribe();
            logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - data');
            logMessage(data);
            logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - url');
            logMessage(url);
            thisCache.dataArrivedSubject.next({data: data, url: url});
            logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - getData-subscribe-cb End');

            const timeoutToken = setTimeout(
              () => {
                clearTimeout(timeoutToken);
                thisCache.runExternalDataRetrievalLoop();
              },
              100);
          }
        });


    logMessage(logMessagePrefix + 'runExternalDataRetrievalLoop() - End');
  }

  private sendRequest(method: HttpMethod, endpoint: string, body: any) {

    // check session
    // todo:  // notify user when session expires or backend reject request due to sesssion invalidataion.
    const url = this.settings.feedApiEndpoint + '/' + endpoint;
    const observableRequest = this.httpClient.request(
      method.toString(),
      url,
      {
        body: body,
        headers: {

        },
        responseType: 'json',
        withCredentials: true
      }
    );

    return observableRequest;
  }
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE'
}

/*
/**
     * Construct a request which interprets the body as JSON and returns the full event stream.
     *
     * @return an `Observable` of all `HttpEvent`s for the request, with a body type of `R`.

    request<R>(method: string, url: string, options: {
      body?: any;
      headers?: HttpHeaders | {
          [header: string]: string | string[];
      };
      reportProgress?: boolean;
      observe: 'events';
      params?: HttpParams | {
          [param: string]: string | string[];
      };
      responseType?: 'json';
      withCredentials?: boolean;
  }): Observable<HttpEvent<R>>;
*/


/**
     * Construct a request which interprets the body as JSON and returns it.
     *
     * @return an `Observable` of the `HttpResponse` for the request, with a body type of `R`.

    request<R>(method: string, url: string, options?: {
      body?: any;
      headers?: HttpHeaders | {
          [header: string]: string | string[];
      };
      observe?: 'body';
      params?: HttpParams | {
          [param: string]: string | string[];
      };
      responseType?: 'json';
      reportProgress?: boolean;
      withCredentials?: boolean;
  }): Observable<R>; */
