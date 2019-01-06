
import { FormBuilder, FormGroup, FormControl, Validators, AsyncValidatorFn } from '@angular/forms';


export namespace modFeed {
    export class SearchFeedForm {
        public searchForm: FormGroup;
        /**
         *
         */
        constructor(private readonly formBuilder: FormBuilder, validators: AsyncValidatorFn[] = []) {
            console.dir(formBuilder);
            this.searchForm = this.formBuilder.group({
                search: [
                    '',
                    [
                        Validators.required
                    ],
                    validators
                ]
                });

                console.dir(this.searchForm);
        }

        public get searchEntry(): FormControl {
            console.log('modFeed::SearchFeedForm::searchEntry() - this.searchForm');
            console.dir(this.searchForm);
            return <FormControl> this.searchForm.get('search');
        }
    }
}

/*,
                        Validators.pattern(/^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9][a-z0-9\-]*$/i)
,
                    validators
*/
