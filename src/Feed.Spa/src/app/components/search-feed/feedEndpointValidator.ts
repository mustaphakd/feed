import { AsyncValidator, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { throwError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as xmlJs from 'xml2js';
// import {Parser} from 'rss-parser';
import { validateNotNull, isDefined } from '../../core/shared/helper';
import * as prsr from '../../core/shared/feedParser';
import { ModHttpService } from 'src/app/core/services/mod-http.service';




export namespace modFeed {
    export class FeedEndpointValidator implements AsyncValidator {
        data: any = null;
        /**
         *
         */
        constructor(private modHttpClient: ModHttpService) {
        }

        public validate(control: AbstractControl): Promise<ValidationErrors> | Observable<ValidationErrors> {

            console.log('modFeed::FeedEndpointValidator::validate() - Start ');
            console.log(this);
            console.log(control);
            console.log(this.modHttpClient);
            validateNotNull(control);
            const value = control.value;
            const promise = new Promise((resolve, reject) => {

                let observable: Observable<Object> = null;

                try {
                    observable = this.modHttpClient.getData(value);

                } catch (exeption) {
                    reject({feedEndPoint: true});
                }


                observable.pipe(
                    tap(
                        data => console.info(data),
                        error => console.error(error)
                    ),
                    catchError((err, caughtObservable) =>  throwError('Exception occurred fetching  ' + value)  )
                )
                .subscribe((data: any) => {

                    console.log('modFeed::FeedEndpointValidator::validate() - data arrived : ');
                    console.dir(data);

                    if (! isDefined(data)) {
                        console.log('modFeed::FeedEndpointValidator::validate() - data arrived but undefined ');
                        return resolve({feedEnpoint: true});
                    }

                    try {
                        xmlJs.parseString(data, (err, result) => {
                            console.log('modFeed::FeedEndpointValidator::validate() - xml2js parseString callback : ');

                            if (err) {
                                console.log('modFeed::FeedEndpointValidator::validate() - xml2Js parsestrring error ');
                                resolve({feedEndPoint: true});
                            }

                            try {

                                console.log('modFeed::FeedEndpointValidator::validate() - Invokking feedParser Startxxx : ');
                                const test = new prsr.modCreate.FeedParser();
                                console.dir(test);
                                const channel = test.parseRss(result);
                                console.log('modFeed::FeedEndpointValidator::validate() - Invokking feedParser END : ');
                                console.log('modFeed::FeedEndpointValidator::validate() - feedTitle : ' + channel.title);
                                return resolve(null);
                            } catch (ex) {
                                console.log('modFeed::FeedEndpointValidator::validate() - Exception thrown : ');
                                console.dir(ex);

                            }

                            console.log('modFeed::FeedEndpointValidator::validate() - feed not found : ');
                            resolve({feedEndpoint: true});
                        });
                    } catch ( ex ) {
                        resolve({feedEndPoint: true});
                    }
                });
            });

            return promise;
        }

        registerOnValidatorChange?(fn: () => void): void {
            throw new Error('Method not implemented.');
        }
}
}
