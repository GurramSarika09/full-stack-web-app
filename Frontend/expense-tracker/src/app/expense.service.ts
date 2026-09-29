import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Expense, ExpenseFilters, ExpenseInput, Summary } from './expense.model';

const API_URL = 'http://localhost:8000/api/expenses';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);

  list(filters: ExpenseFilters): Observable<Expense[]> {
    return this.http
      .get<Expense[]>(API_URL, { params: toParams(filters) })
      .pipe(map((items) => items.map(normalize)));
  }

  summary(filters: ExpenseFilters): Observable<Summary> {
    return this.http.get<Summary>(`${API_URL}/summary`, { params: toParams(filters) }).pipe(
      map((s) => ({
        total: Number(s.total),
        count: s.count,
        by_category: s.by_category.map((c) => ({ ...c, total: Number(c.total) })),
      })),
    );
  }

  create(input: ExpenseInput): Observable<Expense> {
    return this.http.post<Expense>(API_URL, input).pipe(map(normalize));
  }

  update(id: number, input: ExpenseInput): Observable<Expense> {
    return this.http.put<Expense>(`${API_URL}/${id}`, input).pipe(map(normalize));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}

// FastAPI serialises Decimal as a string; convert to number for display/maths.
function normalize(e: Expense): Expense {
  return { ...e, amount: Number(e.amount) };
}

function toParams(filters: ExpenseFilters): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params = params.set(key, value);
  }
  return params;
}
