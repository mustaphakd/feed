import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FeedManagerService } from 'src/app/core/services/feed-manager.service';
import { RssChannel, RssChannelItem, RssChannelBase } from 'src/app/core/shared/types';
import { logMessage, validateNotNull, validateStringNotEmpty } from 'src/app/core/shared/helper';
import { isDefined } from '@angular/compiler/src/util';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';


const logMessagePrefix = 'components-module::ChannelsTree::';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'channels-tree',
  templateUrl: './channels-tree.component.html',
  styleUrls: ['./channels-tree.component.css']
})
export class ChannelsTreeComponent implements OnInit {

  private rssChannels_: Array<RssChannel>;
  private channelObservableToken: any = null;
  public nestedTreeControl: NestedTreeControl<RssChannelBase>;
  public nestedDataSource: MatTreeNestedDataSource<RssChannelBase>;
  private selectedRssChannelItem_: RssChannelItem;
  private selectedRssChannel_: RssChannel;
  private mouseoverUrl_: string;

  @Output() rssChannelSelected = new EventEmitter<RssChannel>();
  @Output() rssChannelItemSelected = new EventEmitter<RssChannelItem>();

  constructor(private readonly feedsManager: FeedManagerService) {
    logMessage(logMessagePrefix + 'ctr');
    this.rssChannels_ = new Array<RssChannel>();
    this.nestedTreeControl = new NestedTreeControl<RssChannelBase>(this.getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
   }

  ngOnInit() {
    logMessage(logMessagePrefix + 'ngOnInit() - Start');
    const thisCache = this;
    this.channelObservableToken = this.feedsManager.getObservableRssChannels()
                                                    .subscribe({
                                                      next: (channel) => {
                                                        // tslint:disable-next-line:max-line-length
                                                        logMessage(logMessagePrefix + 'ngOnInit() -:: etObservableRssChannels callback -Data arrived. channel: ');
                                                        logMessage(channel);
                                                        thisCache.appendChannel(channel);
                                                        // tslint:disable-next-line:max-line-length
                                                        logMessage(logMessagePrefix + 'ngOnInit() -:: etObservableRssChannels callback -Data arrived. END ');
                                                      }
                                                    });
      logMessage(logMessagePrefix + 'ngOnInit() - END');
  }

  public get rssChannels(): Array<RssChannel> {
    return this.rssChannels_;
  }

  public get selectedRssChannelItem(): RssChannelItem {
    return this.selectedRssChannelItem_;
  }

  public get selectedRssChannel(): RssChannel {
    return this.selectedRssChannel_;
  }

  public selectChannelItem(rssChannelItem: RssChannelItem): void {
    logMessage(logMessagePrefix + 'selectChannelItem() - Start - rssChannelItem, rssChannel: ');
    logMessage(rssChannelItem);
    this.selectedRssChannelItem_ = rssChannelItem;
    this.selectedRssChannel_ = rssChannelItem.parent;
    this.rssChannelSelected.emit(this.selectedRssChannel_);
    this.rssChannelItemSelected.emit(this.selectedRssChannelItem_);
    logMessage(logMessagePrefix + 'selectChannelItem() - End ');
  }

  public selectChannel(rssChannel: RssChannel): void {
    logMessage(logMessagePrefix + 'selectChannel() - Start - rssChannelItem, rssChannel: ');
    logMessage(rssChannel);
    this.selectedRssChannelItem_ = rssChannel.items[0];
    this.selectedRssChannel_ = rssChannel;
    this.rssChannelSelected.emit(this.selectedRssChannel_);
    this.rssChannelItemSelected.emit(this.selectedRssChannelItem_);
    logMessage(logMessagePrefix + 'selectChannel() - End ');

  }

  public hasNestedChild(idxPos: number, nodeData: any): boolean {
    logMessage(logMessagePrefix + 'hasNestedChild() - Start - nodeData: ');
    logMessage(nodeData);
    validateNotNull(nodeData);
    logMessage(logMessagePrefix + 'hasNestedChild() - End - ');
    return  isDefined(nodeData.items) && isDefined(nodeData.items.length) && nodeData.items.length > 0 ;
  }

  public setMouseOver(rssChannel: RssChannel): void {
   // logMessage(logMessagePrefix + 'setMouseOver() - Start - rssChannel: ');
    validateNotNull(rssChannel);
    this.mouseoverUrl_ = rssChannel.link;
   // logMessage(logMessagePrefix + 'setMouseOver() - End  ');
  }

  public isMouseOver(rssChannel: RssChannel): boolean {
  //  logMessage(logMessagePrefix + 'isMouseOver() - Start - rssChannel: ');
    validateNotNull(rssChannel);

    if (! isDefined(this.mouseoverUrl_)) {
      return false;
    }

    logMessage(logMessagePrefix + 'isMouseOver() - End  ');
    return rssChannel.link === this.mouseoverUrl_;
  }

  public mouseOverBlur(): void {
    this.mouseoverUrl_ = null;
  }

  public removeChannel(rssChannel: RssChannel): void {
    logMessage(logMessagePrefix + 'removeChannel() - Start - rssChannel: ');
    validateNotNull(rssChannel);

    const channelPos = this.findChannelPosition(rssChannel.link);
    logMessage(logMessagePrefix + 'removeChannel() - Found rssChannel @: ' + channelPos);

    if (channelPos < 0) {
      return;
    }

    this.rssChannels_.splice(channelPos, 1);
    this.nestedDataSource.data = this.rssChannels_;
    this.feedsManager.removeChannel(rssChannel);

    logMessage(logMessagePrefix + 'removeChannel() - End  ');
  }

  private getChildren(node: RssChannel): Array<RssChannelItem> {
    logMessage(logMessagePrefix + 'getChildren() - Start - node: ');
    logMessage(node);
    logMessage(logMessagePrefix + 'getChildren() - End - ');
    return node.items;
  }

  private findChannelPosition(url: string): number {
    logMessage(logMessagePrefix + 'findChannelPosition() - Start - url: ');
    logMessage(url);
    validateStringNotEmpty(url);

    const channelsLength = this.rssChannels_.length;

    for (let i = 0; i < channelsLength; i++) {
      const channel = this.rssChannels_[i];
      const channelUrl = channel.link;
      logMessage(logMessagePrefix + 'findChannelPosition() - checking @: ' + i);
      logMessage(channelUrl);

      if (channelUrl === url) {
        logMessage(logMessagePrefix + 'findChannelPosition() - End -  Found @: ' + i);
        return i;
      }
    }

    logMessage(logMessagePrefix + 'findChannelPosition() - End - Not found');
    return -1;
  }

  private appendChannel(rssChannel: RssChannel): void {
    logMessage(logMessagePrefix + 'appendChannel() - Start - rssChannel: ');
    logMessage(rssChannel);
    validateNotNull(rssChannel);

    const rssChannelLength = this.rssChannels_.length;

    for (let i = 0; i < rssChannelLength; i++) {
      const channel = this.rssChannels_[i];

      if (channel.link === rssChannel.link) {
        return;
      }
    }

    this.rssChannels_.push(rssChannel);
    this.nestedDataSource.data = this.rssChannels_;

    if (this.rssChannels_.length < 2) {
      this.selectChannel(rssChannel);
    }

    logMessage(logMessagePrefix + 'appendChannel() - Start - rssChannel: ');
  }

}
