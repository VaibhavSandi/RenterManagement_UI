import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, Flat } from '../../models/interfaces';

@Component({
  selector: 'app-renter-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renter-master.component.html',
  styleUrls: ['./renter-master.component.css']
})
export class RenterMasterComponent implements OnInit {
  renters: Renter[] = [];
  flats: Flat[] = [];
  showModal = false;
  showViewModal = false;
  isEditing = false;
  currentRenter: Renter = this.getEmptyRenter();
  viewRenter: Renter | null = null;

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.renters = this.dataService.getRenters();
    this.flats = this.dataService.getFlats();
  }

  getEmptyRenter(): Renter {
    return {
      id: 0,
      renterName: '',
      mobileNumber: '',
      flatId: 0,
      flatNo: '',
      buildingName: '',
      joiningDate: '',
      monthlyRent: 0,
      depositPaid: 0,
      idProofNo: '',
      status: 'Active'
    };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentRenter = this.getEmptyRenter();
    this.showModal = true;
  }

  openEditModal(renter: Renter): void {
    this.isEditing = true;
    this.currentRenter = { ...renter };
    this.showModal = true;
  }

  openViewModal(renter: Renter): void {
    this.viewRenter = renter;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.showViewModal = false;
  }

  onFlatChange(): void {
    const flat = this.flats.find(f => f.id === +this.currentRenter.flatId);
    if (flat) {
      this.currentRenter.flatNo = flat.flatNo;
      this.currentRenter.buildingName = flat.buildingName;
      this.currentRenter.monthlyRent = flat.monthlyRent;
    }
  }

  saveRenter(): void {
    if (this.isEditing) {
      this.dataService.updateRenter(this.currentRenter);
    } else {
      this.dataService.addRenter(this.currentRenter);
    }
    this.loadData();
    this.closeModal();
  }

  deleteRenter(id: number): void {
    if (confirm('Are you sure you want to delete this renter?')) {
      this.dataService.deleteRenter(id);
      this.loadData();
    }
  }
}
