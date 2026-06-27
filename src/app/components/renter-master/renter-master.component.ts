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
import { ParkingService } from '../../services/parking.service';
import { parkingmodel } from '../../models/parking.model';

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
  availableParkingSpots:parkingmodel[] = []; // Hardcoded available spots

  // Filter state
  filterSearch = '';
  filterStatus = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  // Pagination state
  currentPage = 1;
  pageSize = 10;

  private langSub!: Subscription;

  constructor(
    private parkingservice:ParkingService,
    private renterService: RenterService,
    private flatService: FlatService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
   this. getEmptyParking()
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
      parkingNo: 0,
      status: 'Active',
     parkingId:0,
     parkingNumber:0,
      isOccupied:true
    };
  }
getEmptyParking():void{

  this.parkingservice.getActivateParking().subscribe({

    next:(response) =>{

      this.availableParkingSpots=response

      console.log(JSON.stringify(this.availableParkingSpots))
    }


  })


}
  openAddModal(): void {
    this.isEditing = false;
    this.currentRenter = this.getEmptyRenter();
    this.getEmptyParking();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(renter: Renter): void {
    this.isEditing = true;
    this.currentRenter = { ...renter };
    this.parkingservice.getActivateParking().subscribe({
      next: (response) => {
        this.availableParkingSpots = response;
        if (this.currentRenter.parkingId) {
          this.availableParkingSpots.push({
            parkingId: this.currentRenter.parkingNo,
            parkingNumber: this.currentRenter.parkingNumber || 0,
            isOccupied: true,
            renterId: 0,
            renterName: this.currentRenter.renterName,
            flatId: 0,
            flatNo: 0
          });
        }
        this.showModal = true;
        this.cdr.markForCheck();
      }
    });
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

    debugger
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
        parkingNo: this.currentRenter.parkingNo,
        status: this.currentRenter.status,
        parkingId: this.currentRenter.parkingId,
        parkingNumber: this.currentRenter.parkingNumber,
        isOccupied: this.currentRenter.isOccupied
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
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  minVal(a: number, b: number): number {
    return Math.min(a, b);
  }

  resetFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterStatus.length > 0;
  }

  // ── Computed list (pre-pagination) ─────────────────────────────
  get filteredRenters(): Renter[] {
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

  // ── Paginated slice ────────────────────────────────────────────
  get displayedRenters(): Renter[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRenters.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRenters.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.cdr.markForCheck();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.cdr.markForCheck();

  }
}
