import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'jw-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class JwPaginationComponent implements OnInit, OnChanges {
  @Input() items: Array<any>;
  @Output() changePage = new EventEmitter<any>(true);
  @Input() initialPage = 1;
  @Input() pageSize = 20;
  @Input() maxPages = 100;
  currentPage: number = 1;
  startPage: number = 1;
  startLength: number;
  totalItems: number;
  endLength: number;
  pager: any = {};

  paginate(totalItems: number, currentPage: number, pageSize: number, maxPages: number) {
    this.totalItems = totalItems;
    /**
     * If no objects exist, override and set the "start length" to 0.
     */
    if (totalItems == 0) {
      this.startLength = 0;
    } else {
      this.startLength = this.pager.pageSize * currentPage - (this.pager.pageSize - 1);
    }

    // calculate total pages
    var totalPages = Math.ceil(totalItems / pageSize);
    if (totalItems < pageSize) {
      pageSize = totalItems;
    }
    // ensure current page isn't out of range
    if (currentPage <= 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (pageSize * currentPage > totalItems) {
      this.endLength = totalItems;
    } else {
      this.endLength = pageSize * currentPage;
    }
    var startPage: number, endPage: number;
    if (totalPages <= maxPages) {
      // total pages less than max so show all pages
      startPage = 1;
      endPage = totalPages;
    } else {
      // total pages more than max so calculate start and end pages
      var maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
      var maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        // current page near the start
        startPage = 1;
        endPage = maxPages;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        // current page near the end
        startPage = totalPages - maxPages + 1;
        endPage = totalPages;
      } else {
        // current page somewhere in the middle
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }
    // calculate start and end item indexes
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
    // create an array of pages to ng-repeat in the pager control
    var pages = Array.from(Array(endPage + 1 - startPage).keys()).map(function(i) {
      return startPage + i;
    });
    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }
  ngOnInit() {
    // set page if items array isn't empty
    if (this.items && this.items.length) {
      this.setPage(this.initialPage);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // reset page if items array has changed
    if (changes.items.currentValue !== changes.items.previousValue) {
      this.setPage(this.initialPage);
    }
  }

  setPage(page: number) {
    /**
     * Disable the backward button if we are on the start page.
     */
    if (page < this.startPage) {
      return;
    }
    /**
     * Disable the forward button if we satisfy the proper criteria
     */
    if (0 >= this.totalItems - this.pageSize * (page - 1)) {
      return;
    }
    // get new pager object for specified page
    this.pager = this.paginate(this.items.length, page, this.pageSize, this.maxPages);

    // get new page of items from items array
    var pageOfItems = this.items.slice(this.pager.startIndex, this.pager.endIndex + 1);

    // call change page function in parent component
    this.changePage.emit(pageOfItems);
  }
}
