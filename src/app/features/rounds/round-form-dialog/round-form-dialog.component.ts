import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Round, RoundCreateDto } from '../../../core/models/round.model';
import { Group } from '../../../core/models/group.model';
import { GroupsService } from '../../groups/groups.service';

export type RoundFormDialogData = Round | { groupId?: string } | null;

@Component({
  selector: 'app-round-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './round-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 360px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
  `],
})
export class RoundFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<RoundFormDialogComponent>);
  private readonly groupsService = inject(GroupsService);
  readonly data = inject<RoundFormDialogData>(MAT_DIALOG_DATA, { optional: true });

  groups: Group[] = [];

  isRound(data: RoundFormDialogData): data is Round {
    return data != null && 'name' in data && '_id' in data;
  }

  private groupId(): string {
    if (!this.data) return '';
    if (this.isRound(this.data)) {
      const g = this.data.group;
      return typeof g === 'string' ? g : g._id;
    }
    return this.data.groupId ?? '';
  }

  readonly form = this.fb.nonNullable.group({
    name: [this.isRound(this.data) ? this.data.name : '', Validators.required],
    group: [this.groupId(), Validators.required],
    roundNumber: [this.isRound(this.data) ? this.data.roundNumber : 1, [Validators.required, Validators.min(1)]],
    date: [this.isRound(this.data) && this.data.date ? this.data.date.slice(0, 10) : ''],
    sortOrder: [this.isRound(this.data) ? (this.data.sortOrder ?? 0) : 0],
  });

  ngOnInit(): void {
    this.groupsService.getAll().subscribe((list) => (this.groups = list));
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: RoundCreateDto & { _id?: string } = {
      name: v.name,
      group: v.group,
      roundNumber: v.roundNumber,
      date: v.date ? new Date(v.date).toISOString() : undefined,
      sortOrder: v.sortOrder,
    };
    if (this.isRound(this.data)) dto._id = this.data._id;
    this.ref.close(dto);
  }
}
