import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LedgerlensService } from '../../services/ledgerlens.service';
import { AuthService } from '../../services/auth.service';
import { SnackService } from '../../services/snack.service';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.css'],
})
export class CreateTransactionComponent implements OnInit {
  public txForm: FormGroup;
  public catNames: string[] = [];

  public isLoading = false;
  public isCategoryLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private ledgerlens: LedgerlensService,
    private authService: AuthService,
    private snack: SnackService,
  ) {
    this.txForm = this.formBuilder.group({
      amount: [''],
      amountType: ['debit'],
      date: [new Date()],
      category: [''],
      notes: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadCategories()]);
    this.txForm.get('category')?.setValue('');
  }

  onCreateClick(): void {}

  private async loadCategories(): Promise<void> {
    this.isCategoryLoading = true;
    const token = await this.authService.getToken();
    try {
      const categories = (await this.ledgerlens.getCategories(token)) as any[];
      this.catNames = categories.map((cat) => cat.name);
    } catch (err) {
      this.snack.error('Failed to load categories.');
    }
    this.isCategoryLoading = false;
    console.log(this.catNames);
  }
}
