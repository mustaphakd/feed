import { entityScope } from '../shared/types';


export namespace modFeed {
    export class SearchFeed {

        /**
         *
         */
        constructor(public readonly url, public readonly scope: entityScope) {}
    }
}
