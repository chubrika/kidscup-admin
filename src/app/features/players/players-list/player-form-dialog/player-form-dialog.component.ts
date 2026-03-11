import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Player, PlayerCreateDto } from '@app/core/models/player.model';
import { TeamsService } from '@app/features/teams/teams.service';
import { Team } from '@app/core/models/team.model';

@Component({
  selector: 'app-player-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './player-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 360px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
  `],
})
export class PlayerFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<PlayerFormDialogComponent>);
  private readonly teamsService = inject(TeamsService);
  readonly data = inject<Player | null>(MAT_DIALOG_DATA, { optional: true });
  readonly teams = signal<Team[]>([]);

  readonly form = this.fb.nonNullable.group({
    firstName: [this.data?.firstName ?? '', Validators.required],
    lastName: [this.data?.lastName ?? '', Validators.required],
    number: [this.data?.number ?? 0, [Validators.required, Validators.min(0)]],
    position: [this.data?.position ?? '', Validators.required],
    birthDate: [this.data?.birthDate ?? '', Validators.required],
    height: [this.data?.height ?? null as number | null],
    teamId: [this.data?.teamId ?? '', Validators.required],
    photo: [this.data?.photo ?? ''],
  });

  ngOnInit(): void {
    this.teamsService.getAll().subscribe((t) => this.teams.set(t));
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: PlayerCreateDto & { id?: string } = {
      firstName: v.firstName,
      lastName: v.lastName,
      number: v.number,
      position: v.position,
      birthDate: v.birthDate,
      height: v.height ?? undefined,
      teamId: v.teamId,
      photo: v.photo || undefined,
    };
    if (this.data?.id) dto.id = this.data.id;
    this.ref.close(dto);
  }
}
