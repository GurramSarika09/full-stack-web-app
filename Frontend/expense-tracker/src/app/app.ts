import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CATEGORIES, Expense, ExpenseFilters, ExpenseInput, Summary } from './expense.model';
import { ExpenseService } from './expense.service';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly api = inject(ExpenseService);
  private readonly fb = inject(FormBuilder);

  protected readonly categories = CATEGORIES;
  protected readonly expenses = signal<Expense[]>([]);
  protected readonly summary = signal<Summary>({ total: 0, count: 0, by_category: [] });
  protected readonly editingId = signal<number | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: [CATEGORIES[0], Validators.required],
    expense_date: [today(), Validators.required],
    notes: [''],
  });

  protected readonly filters = this.fb.nonNullable.group({
    category: '',
    start: '',
    end: '',
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const filters: ExpenseFilters = this.filters.getRawValue();
    this.loading.set(true);
    forkJoin([this.api.list(filters), this.api.summary(filters)]).subscribe({
      next: ([expenses, summary]) => {
        this.expenses.set(expenses);
        this.summary.set(summary);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => this.fail(err),
    });
  }

  protected clearFilters(): void {
    this.filters.reset();
    this.load();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const input: ExpenseInput = { ...raw, title: raw.title.trim(), notes: raw.notes.trim() || null };
    const id = this.editingId();
    const request = id === null ? this.api.create(input) : this.api.update(id, input);
    request.subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      error: (err) => this.fail(err),
    });
  }

  protected edit(expense: Expense): void {
    this.editingId.set(expense.id);
    this.form.setValue({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      expense_date: expense.expense_date,
      notes: expense.notes ?? '',
    });
  }

  protected remove(expense: Expense): void {
    if (!window.confirm(`Delete "${expense.title}"?`)) return;
    this.api.delete(expense.id).subscribe({
      next: () => {
        if (this.editingId() === expense.id) this.resetForm();
        this.load();
      },
      error: (err) => this.fail(err),
    });
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.reset({ category: CATEGORIES[0], expense_date: today() });
  }

  protected percent(value: number): number {
    const total = this.summary().total;
    return total ? (value / total) * 100 : 0;
  }

  private fail(err: unknown): void {
    console.error(err);
    this.loading.set(false);
    this.error.set('Could not reach the API. Is the FastAPI server running on port 8000?');
  }
}

function today(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
