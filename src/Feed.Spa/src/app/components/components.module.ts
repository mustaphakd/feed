import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFeedComponent } from './search-feed/search-feed.component';
import { CoreModule } from '../core/core.module';
import { LibsModule } from '../libs/libs.module';
import { MatFormFieldControl, MatIcon } from '@angular/material';
import { ChannelsTreeComponent } from './channels-tree/channels-tree.component';
import { FrameHostComponent} from './frame-host/frame-host.component';

@NgModule({
  imports: [
    CoreModule
  ],
  declarations: [SearchFeedComponent, ChannelsTreeComponent, FrameHostComponent],
  exports: [SearchFeedComponent, ChannelsTreeComponent, FrameHostComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  entryComponents: [ ]
})
export class ComponentsModule { }
