import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { FlatService } from '../../services/flat.service';
import { Flat } from '../../models/flat.model';
import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flat-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flat-master.component.html',
  styleUrls: ['./flat-master.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlatMasterComponent implements OnInit, OnDestroy {
  flats: Flat[] = [];
  showModal = false;
  isEditing = false;
  currentFlat: Flat = this.getEmptyFlat();

  // Filter state
  filterSearch = '';
  filterStatus = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    private flatService: FlatService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFlats();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  loadFlats(): void {
    this.flatService.getAllFlats().subscribe({
      next: (response) => {
        this.flats = response;
        this.cdr.markForCheck();
      },
      error: () => {
        alert(this.lang.t('flat_err_load'));
        this.cdr.markForCheck();
      }
    });
  }

  getEmptyFlat(): Flat {
    return { flatId: 0, flatNo: '', buildingName: '', monthlyRent: 0, depositAmount: 0, status: 'Vacant' };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentFlat = this.getEmptyFlat();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(flat: Flat): void {
    this.isEditing = true;
    this.currentFlat = { ...flat };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  saveFlat(): void {
    if (this.isEditing) {
      this.flatService.updateFlat(this.currentFlat.flatId!, this.currentFlat).subscribe({
        next: () => {
          alert(this.lang.t('flat_success_update'));
          this.loadFlats();
          this.closeModal();
        },
        error: (error) => {
          if (error.status === 404) alert(this.lang.t('flat_err_not_found'));
          else if (error.status === 400) alert(this.lang.t('flat_err_invalid'));
          else if (error.status === 500) alert(this.lang.t('flat_err_server'));
          else alert(this.lang.t('flat_err_unexpected'));
          alert(this.lang.t('flat_err_update'));
        }
      });
    } else {
      const payload = {
        flatNo: this.currentFlat.flatNo,
        buildingName: this.currentFlat.buildingName,
        monthlyRent: this.currentFlat.monthlyRent,
        depositAmount: this.currentFlat.depositAmount,
        status: this.currentFlat.status
      };
      this.flatService.createFlat(payload).subscribe({
        next: () => {
          alert(this.lang.t('flat_success_create'));
          this.loadFlats();
          this.closeModal();
        },
        error: () => { alert(this.lang.t('flat_err_save')); }
      });
    }
  }

  deleteFlat(id: number): void {
    if (confirm(this.lang.t('flat_confirm_delete'))) {
      this.flatService.deleteFlat(id).subscribe({
        next: () => {
          alert(this.lang.t('flat_success_delete'));
          this.loadFlats();
        },
        error: (err) => {
          try {
            const errorObj = JSON.parse(err.error);
            alert(errorObj.errorMessage);
          } catch {
            alert(this.lang.t('flat_err_delete'));
          }
        }
      });
    }
  }

  // ── Sort ────────────────────────────────────────────────────────
  onSort(column: string): void {
    this.sortConfig = toggleSort(this.sortConfig, column);
    this.cdr.markForCheck();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  resetFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterStatus.length > 0;
  }

  // ── Computed list ──────────────────────────────────────────────
  get displayedFlats(): Flat[] {
    let result = this.flats;

    // Filter by search
    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(f =>
        f.flatNo.toLowerCase().includes(q) ||
        f.buildingName.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (this.filterStatus) {
      result = result.filter(f => f.status === this.filterStatus);
    }

    // Sort
    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }

  get occupiedCount(): number {
    return this.flats.filter(f => f.status === 'Occupied').length;
  }

  get vacantCount(): number {
    return this.flats.filter(f => f.status === 'Vacant').length;
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }
}
