import { Injectable } from '@angular/core';
import { FeedItem, FeedItemWithOperation, OperationKind } from '../shared/types';
import { logMessage, validateNotNull, isDefined, validateStringNotEmpty } from '../shared/helper';


const TRACKED_LIST_IDENTIFIER = 'trackedfeeditem_lcl_store';
const UNTRACKED_LIST_IDENTIFIER = 'untrackedfeeditem_lcl_store';
const logMessagePrefix = 'core-module::services::FeedStorageService::';

@Injectable({
  providedIn: 'root'
})
export class FeedStorageService {

  constructor() {
    this.initCache();
   }

  public clearCache(): void {
    logMessage(logMessagePrefix + 'clearCache() - Start - ');
    localStorage.setItem(TRACKED_LIST_IDENTIFIER, JSON.stringify(new Map<string, FeedItemWithOperation>()));
    localStorage.setItem(UNTRACKED_LIST_IDENTIFIER, JSON.stringify(new Map<string, FeedItem>()));
    logMessage(logMessagePrefix + 'clearCache() - END - ');
  }

  public preloadCache(feedItems: Array<FeedItem>): void {
    logMessage(logMessagePrefix + 'preloadCache() - Start - feedItems: ');
    logMessage(feedItems);
    validateNotNull(feedItems);
    this.storeUntrackedFeedItems(feedItems);
    logMessage(logMessagePrefix + 'preloadCache() - END - ');
  }

  public get feedItems(): Array<FeedItem> {
    logMessage(logMessagePrefix + 'feedItems() - Start - ');

    const iterator = this.feedIterator();
    const feedItems: Array<FeedItem> = new Array<FeedItem>();
    let nextValue: IteratorResult<FeedItem>;
    logMessage(logMessagePrefix + 'feedItems() - iterator - ');
    logMessage(iterator);

    do {
      nextValue = iterator.next();
      const value = nextValue.value;
      logMessage(logMessagePrefix + 'feedItems() - iterator nextValue - ');
      logMessage(nextValue);

      if (isDefined(value)) {
        feedItems.push(value);
      }

    } while (nextValue.done === false);

    logMessage(logMessagePrefix + 'feedItems() - END - ');
    return feedItems;
  }

  public doesItemExist(identifer: string): boolean {
    logMessage(logMessagePrefix + 'doesItemExist() - Start - key: ' + identifer);
    validateStringNotEmpty(identifer);
    const trackedFeedItem = this.trackedFeedItems;
    let hasKey = trackedFeedItem.has(identifer);

    if (hasKey === true) {
      logMessage(logMessagePrefix + 'doesItemExist() - Start - key: [[' + identifer + ']] has been found in tracked feed items');
      const feedItemWithOperation = trackedFeedItem.get(identifer);

      if (feedItemWithOperation.operationKind === OperationKind.Add) {
        return true;
      }
    }

    const unTrackedFeedItem = this.untrackedFeedItems;
    hasKey = unTrackedFeedItem.has(identifer);
    logMessage(logMessagePrefix + 'doesItemExist() - END - found in untracked feed items ?? => ' + hasKey);
    return hasKey;
  }

  public trackRemoval(feedItem: FeedItem): void {
    // create new feedItem with Operation and add it to different store
    logMessage(logMessagePrefix + 'trackRemoval() - Start - feedItem');
    logMessage(feedItem);
    validateNotNull(feedItem);

    this.trackOperation(feedItem, OperationKind.Remove);
    logMessage(logMessagePrefix + 'trackRemoval() - END - ');
  }

  public trackAddition(feedItem: FeedItem): void {
    // create new feedItem with Operation and add it to different store
    logMessage(logMessagePrefix + 'trackAddition() - Start - feedItem');
    logMessage(feedItem);
    validateNotNull(feedItem);

    this.trackOperation(feedItem, OperationKind.Add);
    logMessage(logMessagePrefix + 'trackAddition() - END - ');
  }

  /**
   * @description callee assumes feedItem is already saved remotely by the backend service
   * @param feedItem Item not requiring tracking
   */
  public add(feedItem: FeedItem): void {
    logMessage(logMessagePrefix + 'add() - Start - feedItem');
    logMessage(feedItem);
    validateNotNull(feedItem);

    const unTrackedFeedItems = this.untrackedFeedItems;
    unTrackedFeedItems.set(feedItem.url, new FeedItem(feedItem.url));
    const unTrackedFeedItemsvalues = <Array<FeedItem>> Array.from(unTrackedFeedItems.values());
    const feedItemsIteratorLength = unTrackedFeedItemsvalues.length;
    const feedItems = new Array<FeedItem>();

    for (let i = 0; i < feedItemsIteratorLength; i++) {
      const item = unTrackedFeedItemsvalues[i];
      logMessage(logMessagePrefix + 'add() - iteration - item');
      logMessage( item);

      feedItems.push(item);
    }

    this.storeUntrackedFeedItems(feedItems);
    logMessage(logMessagePrefix + 'add() - END - ');
  }

  public remove(feedItem: FeedItem): void {
    logMessage(logMessagePrefix + 'remove() - Start - feedItem');
    logMessage(feedItem);
    validateNotNull(feedItem);

    const unTrackedFeedItems = this.untrackedFeedItems;
    const keyFound = unTrackedFeedItems.has(feedItem.url);

    if (keyFound === false) {
      return;
    }

    unTrackedFeedItems.delete(feedItem.url);
    const unTrackedFeedItemsvalues = <Array<FeedItem>> Array.from(unTrackedFeedItems.values());
    const feedItemsIteratorLength = unTrackedFeedItemsvalues.length;
    const feedItems = new Array<FeedItem>();

    for (let i = 0; i < feedItemsIteratorLength; i++) {
      const item = unTrackedFeedItemsvalues[i];
      logMessage(logMessagePrefix + 'remove() - iteration - item');
      logMessage( item);

      feedItems.push(item);
    }

    this.storeUntrackedFeedItems(feedItems);
    logMessage(logMessagePrefix + 'remove() - END - ');

  }

  private *feedIterator(): IterableIterator<FeedItem> {
    logMessage(logMessagePrefix + 'feedIterator() - Start - ');
    const trackedFeedItems = this.trackedFeedItems;
    const trackedFeedItemsvalues = <Array<FeedItemWithOperation>> Array.from(trackedFeedItems.values());
    const trackedFeedItemsValuesLength = trackedFeedItemsvalues.length;

    logMessage(logMessagePrefix + 'feedIterator() - trackedFeedItems,  trackedFeedItemsvalues, trackedFeedItemsValuesLength- ');
    logMessage(trackedFeedItems);
    logMessage(trackedFeedItemsvalues);
    logMessage(trackedFeedItemsValuesLength);

    for (let i = 0; i < trackedFeedItemsValuesLength; i++) {
      const feedItem: FeedItemWithOperation = trackedFeedItemsvalues[i];
      logMessage(logMessagePrefix + 'feedIterator() - trackedFeedItem- ');
      logMessage(feedItem);
      const markedForRemoval = feedItem.operationKind;

      if (markedForRemoval === OperationKind.Remove ) {
        continue;
      }

      yield feedItem;
    }

    const unTrackedFeedItems = this.untrackedFeedItems;
    const unTrackedFeedItemsvalues = <Array<FeedItem>> Array.from(unTrackedFeedItems.values());
    const unTrackedFeedItemsValuesLength = unTrackedFeedItemsvalues.length;

    logMessage(logMessagePrefix + 'feedIterator() - unTrackedFeedItems,  unTrackedFeedItemsvalues, unTrackedFeedItemsValuesLength- ');
    logMessage(unTrackedFeedItems);
    logMessage(unTrackedFeedItemsvalues);
    logMessage(unTrackedFeedItemsValuesLength);

    for (let i = 0; i < unTrackedFeedItemsValuesLength; i++) {
      const feedItem = unTrackedFeedItemsvalues[i];
      logMessage(logMessagePrefix + 'feedIterator() - unTrackedFeedItem- ');
      logMessage(feedItem);
      yield feedItem;
    }


    logMessage(logMessagePrefix + 'feedIterator() - END - ');
  }

  private initCache(): void {
    logMessage(logMessagePrefix + 'InitCache() - Start - ');

    try {
      const values = this.trackedFeedItems;
    } catch (exception) {
      localStorage.setItem(TRACKED_LIST_IDENTIFIER, JSON.stringify(new Map<string, FeedItemWithOperation>()));
    }

    try {
      const values = this.untrackedFeedItems;
    } catch (expection) {
      localStorage.setItem(UNTRACKED_LIST_IDENTIFIER, JSON.stringify(new Map<string, FeedItem>()));
    }

    logMessage(logMessagePrefix + 'InitCache() - END - ');
  }

  private trackOperation(feedItem: FeedItem, operation: OperationKind): void {
    // create new feedItem with Operation and add it to different store
    logMessage(logMessagePrefix + 'trackOperation() - Start - feedItem');
    logMessage(feedItem);
    logMessage(operation);
    validateNotNull(feedItem);

    const trackedFeedItems = this.trackedFeedItems;
    trackedFeedItems.set(feedItem.url, new FeedItemWithOperation(feedItem.url, operation));
    const trackedFeedItemsvalues =  <Array<FeedItemWithOperation>> Array.from(trackedFeedItems.values());
    const feedItemsIteratorLength = trackedFeedItemsvalues.length;
    const feedItems = new Array<FeedItemWithOperation>();

    for (let i = 0; i < feedItemsIteratorLength; i++) {
      const item = trackedFeedItemsvalues[i];
      logMessage(logMessagePrefix + 'trackOperation() - iteration - item');
      logMessage( item);

      feedItems.push(item);
    }

    this.storeTrackedFeedItems(feedItems);
    logMessage(logMessagePrefix + 'trackAddition() - END - ');
  }

  private get untrackedFeedItems(): Map<string, FeedItem> {
    logMessage(logMessagePrefix + 'untrackedFeedItems() - Start - ');

    const stringVersion = localStorage.getItem(UNTRACKED_LIST_IDENTIFIER);
    const feedItems = new Map<string, FeedItem>();
    const tempStore = <Array<{url: string, feedItem: FeedItem}>>JSON.parse(stringVersion);
    logMessage(tempStore);
    const tempStoreLength = tempStore.length;

    for (let i = 0; i < tempStoreLength; i++) {
      const temp = tempStore[i];

      if (! isDefined(temp) || ! isDefined(temp.url) || ! isDefined(temp.feedItem)) {
        continue;
      }

      feedItems.set(temp.url, temp.feedItem);
    }

    logMessage(logMessagePrefix + 'untrackedFeedItems() - END - ');
    return feedItems;
  }

  private storeUntrackedFeedItems(feedItems: Array<FeedItem>): void {
    logMessage(logMessagePrefix + 'storeUntrackedFeedItems() - Start - feedItems: ');
    logMessage(feedItems);
    validateNotNull(feedItems);

    const mappedFeedItems = new Array<{url: string, feedItem: FeedItem}>();    // new Map<string, FeedItem>();
    const feedItemsLength = feedItems.length;

    for (let i = 0 ; i < feedItemsLength; i++) {
      const feedItem = feedItems[i];
      const url = feedItem.url;

      mappedFeedItems.push({url: url, feedItem: feedItem});
    }

    const stringVersion = JSON.stringify(mappedFeedItems);
    localStorage.setItem(UNTRACKED_LIST_IDENTIFIER, stringVersion);
    logMessage(logMessagePrefix + 'storeUntrackedFeedItems() - END - ');
  }

  private get trackedFeedItems(): Map<string, FeedItemWithOperation> {
    logMessage(logMessagePrefix + 'trackedFeedItems() - Start - ');

    const stringVersion = localStorage.getItem(TRACKED_LIST_IDENTIFIER);
    const feedItemsWithOperations = new Map<string, FeedItemWithOperation>();
    const tempStore = <Array<{url: string, feedItem: FeedItemWithOperation}>>JSON.parse(stringVersion);
    logMessage(tempStore);
    const tempStoreLength = tempStore.length;

    for (let i = 0; i < tempStoreLength; i++) {
      const temp = tempStore[i];

      if (! isDefined(temp) || ! isDefined(temp.url) || ! isDefined(temp.feedItem)) {
        continue;
      }

      feedItemsWithOperations.set(temp.url, temp.feedItem);
    }

    logMessage(logMessagePrefix + 'trackedFeedItems() - END - ');
    return feedItemsWithOperations;
  }

  private storeTrackedFeedItems(feedItems: Array<FeedItemWithOperation>): void {
    logMessage(logMessagePrefix + 'storeTrackedFeedItems() - Start - feedItems: ');
    logMessage(feedItems);
    validateNotNull(feedItems);

    const mappedFeedItems = new Array<{url: string, feedItem: FeedItemWithOperation}>();
    const feedItemsLength = feedItems.length;

    for (let i = 0 ; i < feedItemsLength; i++) {
      const feedItem = feedItems[i];
      const url = feedItem.url;

      mappedFeedItems.push({url: url, feedItem: feedItem});
    }

    const stringVersion = JSON.stringify(mappedFeedItems);
    localStorage.setItem(TRACKED_LIST_IDENTIFIER, stringVersion);
    logMessage(logMessagePrefix + 'storeTrackedFeedItems() - END - ');
  }
}
