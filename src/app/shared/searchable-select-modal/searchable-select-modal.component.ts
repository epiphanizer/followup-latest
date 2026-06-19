import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';

export interface SearchableSelectModalItem {
  label: string;
  value: string | number;
  searchText?: string;
}

export interface SearchableSelectModalGroup {
  key: string;
  label: string;
  items: SearchableSelectModalItem[];
}

@Component({
  selector: 'app-searchable-select-modal',
  templateUrl: './searchable-select-modal.component.html',
  styleUrls: ['./searchable-select-modal.component.scss'],
  standalone: false
})
export class SearchableSelectModalComponent implements AfterViewInit {
  @Input() title: string = 'Select an option';
  @Input() items: SearchableSelectModalItem[] = [];
  @Input() groups: SearchableSelectModalGroup[] = [];
  @Input() selectedValue: string | number | null = null;
  @Input() placeholder: string = 'Search';

  @ViewChild(IonSearchbar) searchbar?: IonSearchbar;

  searchText: string = '';
  tempSelectedValue: string | number | null = null;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.tempSelectedValue = this.selectedValue;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchbar?.setFocus?.();
    }, 50);
  }

  get filteredGroups(): SearchableSelectModalGroup[] {
    const sourceGroups = this.groups.length
      ? this.groups
      : [
          {
            key: 'default',
            label: '',
            items: this.items
          }
        ];
    const normalizedSearch = this.normalizeSearchValue(this.searchText);

    if (!normalizedSearch) {
      return sourceGroups.filter((group: SearchableSelectModalGroup) => group.items.length > 0);
    }

    return sourceGroups
      .map((group: SearchableSelectModalGroup) => ({
        ...group,
        items: group.items.filter((item: SearchableSelectModalItem) => this.matchesSearch(item, normalizedSearch))
      }))
      .filter((group: SearchableSelectModalGroup) => group.items.length > 0);
  }

  get hasResults(): boolean {
    return this.filteredGroups.length > 0;
  }

  get hasSelection(): boolean {
    return this.tempSelectedValue !== null && this.tempSelectedValue !== undefined && this.tempSelectedValue !== '';
  }

  onSearchChange(event: CustomEvent) {
    this.searchText = String(event?.detail?.value || '');
  }

  selectValue(value: string | number) {
    this.tempSelectedValue = value;
  }

  cancel() {
    this.modalController.dismiss(undefined, 'cancel');
  }

  confirm() {
    this.modalController.dismiss({ value: this.tempSelectedValue }, 'confirm');
  }

  trackByValue(index: number, item: SearchableSelectModalItem): string | number {
    return item?.value ?? index;
  }

  trackByGroup(index: number, group: SearchableSelectModalGroup): string {
    return group?.key || String(index);
  }

  private matchesSearch(item: SearchableSelectModalItem, normalizedSearch: string): boolean {
    const searchableText = [item?.label, item?.searchText].filter(Boolean).join(' ');
    return this.normalizeSearchValue(searchableText).includes(normalizedSearch);
  }

  private normalizeSearchValue(value: string): string {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim();
  }
}