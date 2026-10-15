import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { Flat } from '../../models/flat.model';
import { FlatService } from '../../services/flat.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';

@Component({
  selector: 'app-expense-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-master.component.html',
  styleUrls: ['./expense-master.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseMasterComponent implements OnInit {
  expenses: Expense[] = [];
  displayedExpenses: Expense[] = [];
  flats: Flat[] = [];
  showModal = false;
  isEditing = false;
  currentExpense: Expense = this.getEmptyExpense();

  // Categories
  categories: string[] = ['Maintenance', 'Plumbing', 'Electrical', 'Tax', 'Utilities', 'Cleaning', 'Other'];

  // Filters
  filterFromDate: string = '';
  filterToDate: string = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  private langSub!: Subscription;

  constructor(
    private expenseService: ExpenseService,
    private flatService: FlatService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  loadData(): void {
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses = res;
        this.applyFilters();
      },
      error: () => alert('Error loading expenses')
    });

    this.flatService.getAllFlats().subscribe({
      next: (res) => {
        this.flats = res;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let result = this.expenses.filter(expense => {
      let matches = true;
      if (this.filterFromDate) {
        matches = matches && (expense.expenseDate >= this.filterFromDate);
      }
      if (this.filterToDate) {
        matches = matches && (expense.expenseDate <= this.filterToDate);
      }
      return matches;
    });
    
    this.displayedExpenses = sortArray(result, this.sortConfig.column, this.sortConfig.direction);
    this.cdr.markForCheck();
  }

  // ── Sort ────────────────────────────────────────────────────────
  onSort(column: string): void {
    this.sortConfig = toggleSort(this.sortConfig, column);
    this.applyFilters();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  resetFilters(): void {
    this.filterFromDate = '';
    this.filterToDate = '';
    this.applyFilters();
  }

  getEmptyExpense(): Expense {
    return {
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'Maintenance',
      flatId: null
    };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentExpense = this.getEmptyExpense();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(expense: Expense): void {
    this.isEditing = true;
    this.currentExpense = { ...expense };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  saveExpense(): void {
    if (this.isEditing) {
      this.expenseService.updateExpense(this.currentExpense.expenseId!, this.currentExpense).subscribe({
        next: () => {
          alert('Expense updated successfully');
          this.loadData();
          this.closeModal();
        },
        error: () => alert('Error updating expense')
      });
    } else {
      this.expenseService.createExpense(this.currentExpense).subscribe({
        next: () => {
          alert('Expense added successfully');
          this.loadData();
          this.closeModal();
        },
        error: () => alert('Error adding expense')
      });
    }
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          alert('Expense deleted');
          this.loadData();
        },
        error: () => alert('Error deleting expense')
      });
    }
  }
}
