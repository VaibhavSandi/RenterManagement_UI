import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { FlatService } from '../../services/flat.service';
import { RenterService } from '../../services/renter.service';
import { Flat } from '../../models/flat.model';
import { Renter } from '../../models/renter.model';
import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-renter-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renter-master.component.html',
  styleUrls: ['./renter-master.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenterMasterComponent implements OnInit, OnDestroy {
  renters: Renter[] = [];
  flats: Flat[] = [];
  showModal = false;
  showViewModal = false;
  isEditing = false;
  currentRenter: Renter = this.getEmptyRenter();
  viewRenter: Renter | null = null;

  // Filter state
  filterSearch = '';
  filterStatus = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    private renterService: RenterService,
    private flatService: FlatService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  loadData(): void {
    this.renterService.getAllRenters().subscribe({
      next: (response) => {
        this.renters = response;
        this.cdr.markForCheck();
      },
      error: () => {
        alert(this.lang.t('renter_err_load'));
        this.cdr.markForCheck();
      }
    });

    this.flatService.getAllFlats().subscribe({
      next: (response) => {
        this.flats = response;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  getEmptyRenter(): Renter {
    return {
      renterId: 0,
      renterName: '',
      mobileNumber: '',
      idProofNo: '',
      flatId: null,
      flatNo: '',
      joiningDate: '',
      monthlyRent: 0,
      depositPaid: 0,
      status: 'Active'
    };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentRenter = this.getEmptyRenter();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(renter: Renter): void {
    this.isEditing = true;
    this.currentRenter = { ...renter };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openViewModal(renter: Renter): void {
    this.viewRenter = renter;
    this.showViewModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.showViewModal = false;
    this.cdr.markForCheck();
  }

  onFlatChange(): void {
    const flat = this.flats.find(f => f.flatId === +this.currentRenter.flatId!);
    if (flat) {
      this.currentRenter.flatNo = flat.flatNo;
      this.currentRenter.monthlyRent = flat.monthlyRent;
    }
    this.cdr.markForCheck();
  }

  saveRenter(): void {
    if (this.isEditing) {
      this.renterService.updateRenter(this.currentRenter.renterId!, this.currentRenter).subscribe({
        next: () => {
          alert(this.lang.t('renter_success_update'));
          this.loadData();
          this.closeModal();
        },
        error: () => { alert(this.lang.t('renter_err_update')); }
      });
    } else {
      const payload: Renter = {
        renterName: this.currentRenter.renterName,
        mobileNumber: this.currentRenter.mobileNumber,
        idProofNo: this.currentRenter.idProofNo,
        flatId: this.currentRenter.flatId,
        flatNo: this.currentRenter.flatNo,
        joiningDate: this.currentRenter.joiningDate,
        monthlyRent: this.currentRenter.monthlyRent,
        depositPaid: this.currentRenter.depositPaid,
        status: this.currentRenter.status
      };
      this.renterService.createRenter(payload).subscribe({
        next: () => {
          alert(this.lang.t('renter_success_add'));
          this.loadData();
          this.closeModal();
        },
        error: () => { alert(this.lang.t('renter_err_add')); }
      });
    }
  }

  deleteRenter(id: number): void {
    if (confirm(this.lang.t('renter_confirm_delete'))) {
      this.renterService.deleteRenter(id).subscribe({
        next: (response) => {
          alert(response);
          this.loadData();
        },
        error: () => {
          alert(this.lang.t('renter_err_delete'));
          this.loadData();
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
  get displayedRenters(): Renter[] {
    let result = this.renters;

    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(r =>
        r.renterName.toLowerCase().includes(q) ||
        r.mobileNumber.toLowerCase().includes(q) ||
        (r.flatNo || '').toLowerCase().includes(q)
      );
    }

    if (this.filterStatus) {
      result = result.filter(r => r.status === this.filterStatus);
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }
}
