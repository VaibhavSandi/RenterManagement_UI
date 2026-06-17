import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Flat } from '../../models/interfaces';

@Component({
  selector: 'app-flat-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flat-master.component.html',
  styleUrls: ['./flat-master.component.css']
})
export class FlatMasterComponent implements OnInit {
  flats: Flat[] = [];
  showModal = false;
  isEditing = false;
  currentFlat: Flat = this.getEmptyFlat();

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.loadFlats();
  }

  loadFlats(): void {
    this.flats = this.dataService.getFlats();
  }

  getEmptyFlat(): Flat {
    return { id: 0, flatNo: '', buildingName: '', monthlyRent: 0, depositAmount: 0, status: 'Vacant' };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentFlat = this.getEmptyFlat();
    this.showModal = true;
  }

  openEditModal(flat: Flat): void {
    this.isEditing = true;
    this.currentFlat = { ...flat };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveFlat(): void {
    if (this.isEditing) {
      this.dataService.updateFlat(this.currentFlat);
    } else {
      this.dataService.addFlat(this.currentFlat);
    }
    this.loadFlats();
    this.closeModal();
  }

  deleteFlat(id: number): void {
    if (confirm('Are you sure you want to delete this flat?')) {
      this.dataService.deleteFlat(id);
      this.loadFlats();
    }
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
