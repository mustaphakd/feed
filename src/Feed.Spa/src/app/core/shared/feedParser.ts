import { logMessage, isStringEmpty } from './helper';
import { validateNotNull, RssChannel, RssChannelItem, isDefined } from './types';


const logMessagePrefix = 'core-module::shared::modCreate::FeedParser::';

export namespace modCreate {
    export class FeedParser {
        /**
         *
         */
        constructor() {
        }

        public parseRss(rssContainer: RssSchema, defaultUrl: string = null): RssChannel {
            logMessage(logMessagePrefix + 'parseRss() - Start');
            validateNotNull(rssContainer);
            logMessage(rssContainer);

            if (isDefined(rssContainer.feed)) {
                return this.parseAtom(rssContainer.feed, defaultUrl);
            }

            const channel = rssContainer.rss.channel[0];
            logMessage(logMessagePrefix + 'parseRss() - channel');
            logMessage(channel);
            console.log(channel);
            const rssChannel = new RssChannel(
                channel.title[0],
                isStringEmpty(defaultUrl) ? channel.link[0] : defaultUrl,
                channel.description[0]);

            const items = <Array<any>>channel.item;
            let itemsLength = items.length;

            if (itemsLength > 3) {
                itemsLength = 3;
            }

            for (let i = 0; i < itemsLength; i++) {
                const item = items[i];
                const rssChannelItem = new RssChannelItem(
                    item.title[0],
                    item.link[0],
                    item.description[0]);

                rssChannelItem.parent = rssChannel;
                rssChannel.items.push(rssChannelItem);
            }

            console.dir(rssChannel);

            logMessage(logMessagePrefix + 'parseRss() - End');
            return rssChannel;
        }

        private parseAtom(atomFeed, defaultUrl: string = null): RssChannel {
            logMessage(logMessagePrefix + 'parseAtom() - Start');
            validateNotNull(atomFeed);
            logMessage(atomFeed);

            const title = this.getFromUnderscore(atomFeed.title[0]);
            const description = title;
            const link = isStringEmpty(defaultUrl) ? atomFeed.link[0].$.href : defaultUrl;

            logMessage(logMessagePrefix + 'parseAtom() - title, description, link');
            logMessage(title);
            logMessage(description);
            logMessage(link);

            const rssChannel = new RssChannel(title, link, description);
            const items = <Array<any>> atomFeed.entry;
            let itemsLength = items.length;
            let itemsAdded = 0;

            for (let i = 0; i < itemsLength; i++) {
                const item = items[i];
                const title = item.title[0];
                const links = item.link;
                try {
                    const rssChannelItem = new RssChannelItem(
                        this.getFromUnderscore(title),
                        this.locateHtmlNonReplyLink(links),
                        'Atom does not support having a description');

                    rssChannelItem.parent = rssChannel;
                    rssChannel.items.push(rssChannelItem);
                    itemsAdded += 1;

                } catch(ex) {
                    logMessage(logMessagePrefix + 'parseAtom() - Exception');
                    logMessage(ex);
                }

                if (itemsAdded >= 3) {
                    break;
                }
            }

            console.dir(rssChannel);
            logMessage(logMessagePrefix + 'parseAtom() - End');
            return rssChannel;
        }

        private locateHtmlNonReplyLink(links: Array<any>): string {
            logMessage(logMessagePrefix + 'locateHtmlNonReplyLink() - Start - links: ');
            logMessage(links);
            validateNotNull(links);

            const linksLength = links.length;
            let href = '';

            for (let i = 0; i < linksLength; i++) {
                const link = links[i];
                let type = '';
                let rel = '';

                if (! isDefined(link.$.type)) {
                    continue;
                }

                type = (<string>link.$.type).toLowerCase();

                if ( type.indexOf('html') < 0) {
                    continue;
                }

                if (! isDefined(link.$.rel)) {
                    href = link.$.href;
                    break;
                }

                rel = (<string>link.$.rel).toLowerCase();

                if ( rel.indexOf('repl') > -1) {
                    continue;
                }

                href = link.$.href;
                break;

            }

            logMessage(href);
            logMessage(logMessagePrefix + 'locateHtmlNonReplyLink() - End');

            return href;
        }

        private getFromUnderscore(obj: any): string {
            logMessage(logMessagePrefix + 'getFromUnderscore() - Start - obj: ');
            logMessage(obj);

            if (typeof(obj) === 'string') {
                return obj;
            }

            if (isDefined(obj._)) {
                return obj._;
            }

            logMessage(logMessagePrefix + 'getFromUnderscore() - End');
        }
    }
}

export interface RssSchema {
    rss: {
        $: any,
        channel: any[]
    };
    feed?: any;
}
