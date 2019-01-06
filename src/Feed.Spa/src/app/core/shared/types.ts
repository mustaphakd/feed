
export enum entityScope {
    local = 'local',
    remote = 'remote'
}

export enum MessageLogLevel {
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error'
}

export enum OperationKind {
    Add = 'add',
    Remove = 'remove',
    Update = 'update'
}

export  function isStringEmpty(item: string): boolean {

    if (! isDefined(item)) {
        return true;
    }

    const text = item.trim();
    const textLength = text.length;

    if (textLength > 0) {
        return false;
    }

    return true;
}

export function validateStringNotEmpty(item: string) {
    validateNotNull(item, 'string cannot be null');
    const isEmpty = isStringEmpty(item);

    if (isEmpty) {
        // tslint:disable-next-line:no-console
        console.trace();
        throw new Error('String empty');
    }
}

export function validateNotNull(item: any, errorMessage: string = '') {
    if ( ! isDefined(item)) {
        // tslint:disable-next-line:no-console
        console.trace();
        throw new Error('Null Exception: ' + errorMessage);
    }
}

export function isDefined(item: any): boolean {
    if (item == null || item === undefined) {
        return false;
    }

    return true;
}

// todo: categories not supported at the moment
export class FeedItem { // used for local storage and transfer

    constructor(public readonly url: string) {
        if (url === undefined || url === null) {
            throw new Error('types::FeedItem::ctor() - Undefined or null url parameter is not acceptable');
        }
        const trimmedString = url.trim();

        if (trimmedString.length < 1) {
            throw new Error('types::FeedItem::ctor() - url must have at least one character.');
        }
    }
}

export class FeedItemWithOperation extends FeedItem {
    constructor(url, public readonly operationKind: OperationKind) {
        super(url);
    }
}


export class RssChannelBase {

    constructor(public readonly title: string, public readonly link: string, public readonly description: string) {
        validateStringNotEmpty(title);
        validateStringNotEmpty(link);
        validateStringNotEmpty(description);
    }
}

// https://www.w3schools.com/xml/xml_rss.asp for futher updates to the types definitions
export class RssChannel extends RssChannelBase {

    constructor(public readonly title: string, public readonly link: string, public readonly description: string) {
        super(title, link, description);
        this.items_ = new Array<RssChannelItem>();
    }

    private category_: string;
    public set category(value: string) {
        validateStringNotEmpty(value);
        this.category_ = value;
    }
    public get category(): string {
        return this.category_;
    }

    private copyRight_: string;
    public set copyRight(value: string) {
        validateStringNotEmpty(value);
        this.copyRight_ = value;
    }
    public get copyRight(): string {
        return this.copyRight_;
    }

    private language_: string;
    public set language(value: string) {
        validateStringNotEmpty(value);
        this.language_ = value;
    }
    public get language(): string {
        return this.language_;
    }

    private image_: RssChannelImage;
    public set image(value: RssChannelImage) {
        validateNotNull(value);
        this.image_ = value;
    }
    public get image(): RssChannelImage {
        return this.image_;
    }

    private items_: Array<RssChannelItem>;
    public get items(): Array<RssChannelItem> {
        return this.items_;
    }

    public addChannelItem(item: RssChannelItem): void {
        validateNotNull(item);
        this.items_.push(item);
    }

    public clearChannelItems(): void {
        this.items_ = [];
    }
}

export class RssChannelImage extends RssChannelBase {
    constructor(public readonly title: string, public readonly link: string, public readonly description: string) {
        super(title, link, description);
    }
}


export class RssChannelItem extends RssChannelBase {

    constructor(public readonly title: string, public readonly link: string, public readonly description: string) {
        super(title, link, description);
    }

    private author_: string;
    public set author(value: string) {
        validateStringNotEmpty(value);
        this.author_ = value;
    }
    public get author(): string {
        return this.author_;
    }

    private comment_: string;
    public set comment(value: string) {
        validateStringNotEmpty(value);
        this.comment_ = value;
    }
    public get comment(): string {
        return this.comment_;
    }

    private enclosure_: RssChannelItemMediaEnclosure;
    public set enclosure(value: RssChannelItemMediaEnclosure) {
        validateNotNull(value);
        this.enclosure_ = value;
    }
    public get enclosure(): RssChannelItemMediaEnclosure {
        return this.enclosure_;
    }

    private parent_: RssChannel;
    public set parent(value: RssChannel) {
        validateNotNull(value);
        this.parent_ = value;
    }
    public get parent(): RssChannel {
        return this.parent_;
    }
}

export class RssChannelItemMediaEnclosure {
    constructor(public readonly url: string, public readonly bytesLength: string, public readonly mediaType: MediaTypes) {
        validateStringNotEmpty(url);
        validateStringNotEmpty(bytesLength);
        validateNotNull(mediaType);
    }
}

export enum MediaTypes {
    AUDIO_MPEG = 'audiompeg',
    AUDIO_MP3 = 'audiomp3',
    AUDIO_WAVE = 'audiowave'
}
