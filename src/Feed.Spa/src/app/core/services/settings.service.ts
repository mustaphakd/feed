import { Injectable } from '@angular/core';
import { FeedItem, FeedItemWithOperation, OperationKind } from '../shared/types';
import { logMessage, validateNotNull, isDefined, validateStringNotEmpty } from '../shared/helper';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    private backendEndpoint_: string;
    private feedApiSegment_ = '/api/feed';

    public get backendEndpoint(): string {
        return this.backendEndpoint_;
    }

    public set backendEndpoint(value: string) {
        this.backendEndpoint_ = value;
    }

    public get feedApiEndpoint(): string {
        return this.backendEndpoint + this.feedApiSegment_;
    }

    public get feedApiFetchEndpoint(): string {
        return this.feedApiEndpoint + '/fetch';
    }

    public get feedApiHTMLEndpoint(): string {
        return this.feedApiEndpoint + '/html';
    }
}
