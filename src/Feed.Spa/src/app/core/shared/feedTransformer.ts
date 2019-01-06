
import * as mdls from '../models/feed';
import { FeedItem, validateNotNull, entityScope } from './types';
import {} from './helper';

export namespace modFeed {
    export class FeedTransformer {

        public static fromFeedItemToFeed(feedItem: FeedItem): mdls.modFeed.Feed {
            validateNotNull(feedItem);
            const feed = new mdls.modFeed.Feed(feedItem.url, entityScope.local);
            return feed;
        }

        public static fromFeedToFeedItem(feed: mdls.modFeed.Feed): FeedItem {
            validateNotNull(feed);
            const feedItem = new FeedItem(feed.Url);
            return feedItem;
        }

        public static fromFeedsToFeedItems(feeds: Array<mdls.modFeed.Feed>): Array<FeedItem> {
            validateNotNull(feeds);
            const feedLength = feeds.length;
            const feedItems = new Array<FeedItem>();

            for (let i = 0; i < feedLength; i++) {
                const feed = feeds[i];
                const feedItem = FeedTransformer.fromFeedToFeedItem(feed);
                feedItems.push(feedItem);
            }

            return feedItems;
        }

        public static fromFeedItemsToFeeds(feedItems: Array<FeedItem>): Array<mdls.modFeed.Feed> {
            validateNotNull(feedItems);
            const feedItemsLength = feedItems.length;
            const feeds = new Array<mdls.modFeed.Feed>();

            for (let i = 0; i < feedItemsLength; i++) {
                const feedItem = feedItems[i];
                const feed = FeedTransformer.fromFeedItemToFeed(feedItem);
                feeds.push(feed);
            }

            return feeds;
        }
    }
}
