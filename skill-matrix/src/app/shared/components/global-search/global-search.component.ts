import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, switchMap, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { GlobalSearchService, SearchResult } from '../../../core/services/global-search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
})
export class GlobalSearchComponent {
  private searchService = inject(GlobalSearchService);
  private router = inject(Router);
  private el = inject(ElementRef);

  query = '';
  results: SearchResult[] = [];
  isOpen = false;
  showInput = false;

  private search$ = new Subject<string>();

  readonly results$ = this.search$.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((q) => (q.length >= 2 ? this.searchService.search(q) : of([]))),
  );

  constructor() {
    this.results$.subscribe((r) => {
      this.results = r;
      this.isOpen = r.length > 0 || this.query.length >= 2;
    });
  }

  onInput(): void {
    this.search$.next(this.query);
  }

  selectResult(result: SearchResult): void {
    this.router.navigate([result.route]);
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.query = '';
    this.results = [];
    this.showInput = false;
  }

  toggleInput(): void {
    this.showInput = !this.showInput;
    if (!this.showInput) this.close();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'employee': return 'person';
      case 'skill': return 'school';
      case 'project': return 'folder';
      case 'certification': return 'verified';
      default: return 'search';
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
