import { entityScope } from '../shared/types';
import * as tg from './tag';
import { validateNotNull, validateStringNotEmpty } from '../shared/helper';


export namespace modFeed {
    export class Feed {
        /**
         *
         */
        private tags: Array<tg.modFeed.Tag> = null;

        constructor( public url: string, private scope: entityScope = entityScope.local) {
            this.tags = new Array<tg.modFeed.Tag>();
        }

        private id_: string;
        public get Id(): string {
            return this.id_;
        }
        public set Id(value: string) {
            this.id_ = value;
        }

        public get Url(): string {
            return this.url;
        }
        public set Url(value: string) {
            this.url = value;
        }

        public get entityScope(): entityScope {
            return this.scope;
        }

        public set entityScope(value: entityScope) {
            this.scope = value;
        }

        public addTag(tag: tg.modFeed.Tag): void {
            validateNotNull(tag, 'tag is required');
            validateStringNotEmpty(tag.label);
            const tagLabel = tag.label.toLowerCase();
            let tagExist = 'false';
            const labels = this.tags.reduce<string[]>( (prev, current, index, source) => {
                const label = current.label;
                if (tagLabel === label) {
                    tagExist = 'true';
                }
                prev.push(label);
                return prev;
            }, new Array<string>());

            if (tagExist === 'true') {
                return;
            }

            this.tags.push( new tg.modFeed.Tag(tagLabel));
        }

        public removeTag(tag: string): void {
            validateStringNotEmpty(tag);
            const tagLabel = tag.toLowerCase();
            let newTags = this.tags.reduce<tg.modFeed.Tag[]>( (prev, current, index, source) => {
                const label = current.label;
                if (tagLabel === label) {
                } else {
                    prev.push(current);
                }
                return prev;
            }, new Array<tg.modFeed.Tag>());

            this.tags = [];
            this.tags = newTags;
            newTags = [];
            newTags = null;
        }


    }
}

/*
public class Feed
    {
        public string Id { get; set; }
        public string iconUrl { get; set; }
        public string url { get; set; }
        public ICollection<FeedTag> FeedTags { get; set; }
        public ICollection<Rating> Ratings { get; set; }


        public ICollection<UserFeeds> UsersFeeds { get; set; }
    }
*/
