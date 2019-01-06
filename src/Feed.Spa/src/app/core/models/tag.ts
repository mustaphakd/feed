import { entityScope } from '../shared/types';


export namespace modFeed {
    export class Tag {
        /**
         *
         */
        constructor( public label: string, private scope: entityScope = entityScope.local) {
        }

        public get entityScope(): entityScope {
            return this.scope;
        }
    }
}
