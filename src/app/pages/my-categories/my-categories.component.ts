import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NewCategoryDialogComponent } from 'src/app/components/new-category-dialog/new-category-dialog.component';
import { AlertService } from 'src/app/services/alert.service';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-my-categories',
  templateUrl: './my-categories.component.html',
  styleUrls: ['./my-categories.component.css'],
})
export class MyCategoriesComponent implements OnInit {
  public isLoading = false;

  displayedColumns: string[] = ['index', 'name', 'balance', 'actions'];
  rawData: any[] = [];
  dataSource: MatTableDataSource<any>;

  constructor(
    private backend: BackendService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.dataSource = new MatTableDataSource([]);
  }

  async ngOnInit() {
    await this.loadTable();
  }

  applySearch(searchValue: string) {
    this.dataSource.filter = searchValue.trim().toLowerCase();
  }

  async loadTable(): Promise<void> {
    this.isLoading = true;

    this.rawData = [];
    const calls = [this.backend.getCategories(), this.backend.getSum({ group: 'category' })];

    try {
      const results = await Promise.all(calls);

      const categories = results[0].data;
      if (categories.length === 0) {
        throw new Error('No categories found.');
      }

      const sums = results[1].data;

      const processedCats = [];

      sums.forEach((entry) => {
        processedCats.push(entry.category);

        this.rawData.push({
          index: this.rawData.length + 1,
          name: entry.category,
          balance: entry.sum,
        });
      });

      categories.forEach((name) => {
        if (processedCats.includes(name)) {
          return;
        }
        this.rawData.push({ index: this.rawData.length + 1, name, balance: 0 });
      });

      this.dataSource = new MatTableDataSource(this.rawData);
    } catch (err) {
      this.alertService.error(err.message);
    }

    this.isLoading = false;
  }

  openNewCategoryDialog(): void {
    this.dialog.open(NewCategoryDialogComponent, {
      width: '400px',
      data: { action: this.createCategory.bind(this) },
    });
  }

  async createCategory(name: string): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.alertService.load('Creating category...');
    try {
      await this.backend.createCategory(name);
      this.alertService.success('Category created.');

      this.rawData.push({ index: this.rawData.length + 1, name, balance: 0 });
      this.dataSource = new MatTableDataSource(this.rawData);
    } catch (err) {
      this.alertService.error(err.message);
    }

    this.isLoading = false;
  }

  async deleteCategory(event: Event, element: any): Promise<void> {
    if (this.isLoading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.isLoading = true;

    this.alertService.load('Deleting...');
    try {
      await this.backend.deleteCategory(element.name);
      this.alertService.success('Category deleted.');

      this.rawData.splice(element.index - 1, 1);
      this.dataSource = new MatTableDataSource(this.rawData);
    } catch (err) {
      this.alertService.error(err.message);
    }

    this.isLoading = false;
  }

  async rowClick(row: any): Promise<void> {
    await this.router.navigate(['/my-transactions'], {
      queryParams: {
        category: row.name,
      },
    });
  }
}
