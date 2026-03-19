import { Component, DestroyRef, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayersService } from '../../players/players.service';
import { Match } from '../../../core/models/match.model';
import { LiveMatchService, MatchEvent, MatchEventType, MatchStats } from '../live-match.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-live-scoring',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './live-scoring.component.html',
  styles: [`
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .player-row { display: grid; grid-template-columns: 1fr; gap: 8px; padding: 12px 0; border-bottom: 1px solid rgba(148,163,184,.35); }
    .player-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .name { font-weight: 600; }
    .line { color: #64748b; font-size: 0.9rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px; background: rgba(148,163,184,.15); }
    .scoreboard { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .score { font-size: 1.25rem; font-weight: 800; }
    .timeline { display: grid; gap: 8px; }
    .evt { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; border-radius: 10px; background: rgba(148,163,184,.08); }
    .evt-meta { color: #64748b; font-size: 0.85rem; }
  `],
})
export class LiveScoringComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly playersService = inject(PlayersService);
  private readonly liveMatchService = inject(LiveMatchService);

  @Input({ required: true }) match!: Match;

  readonly stats = signal<MatchStats>({ teamScores: [], playerStats: [] });
  readonly timeline = signal<MatchEvent[]>([]);

  readonly homePlayers = signal<{ _id: string; name?: string; firstName?: string; lastName?: string }[]>([]);
  readonly awayPlayers = signal<{ _id: string; name?: string; firstName?: string; lastName?: string }[]>([]);

  readonly homeScore = computed(() => {
    const teamId = this.match?.homeTeam?._id;
    if (!teamId) return 0;
    return this.stats().teamScores.find((t) => t.teamId === teamId)?.points ?? 0;
  });

  readonly awayScore = computed(() => {
    const teamId = this.match?.awayTeam?._id;
    if (!teamId) return 0;
    return this.stats().teamScores.find((t) => t.teamId === teamId)?.points ?? 0;
  });

  ngOnInit(): void {
    const matchId = this.match?._id;
    if (!matchId) return;

    this.liveMatchService.connectToMatch(matchId);

    forkJoin({
      stats: this.liveMatchService.getStats(matchId),
      timeline: this.liveMatchService.getTimeline(matchId, 30),
      homePlayers: this.match.homeTeam?._id ? this.playersService.getByTeam(this.match.homeTeam._id) : [],
      awayPlayers: this.match.awayTeam?._id ? this.playersService.getByTeam(this.match.awayTeam._id) : [],
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ stats, timeline, homePlayers, awayPlayers }) => {
        this.stats.set(stats);
        this.timeline.set(timeline);
        this.homePlayers.set(homePlayers as any);
        this.awayPlayers.set(awayPlayers as any);
      });

    this.liveMatchService
      .onMatchUpdate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ matchId: updatedMatchId, stats }) => {
        if (updatedMatchId !== matchId) return;
        this.stats.set(stats);
        this.liveMatchService
          .getTimeline(matchId, 30)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((events) => this.timeline.set(events));
      });
  }

  playerName(p: { name?: string; firstName?: string; lastName?: string }): string {
    if (p.name) return p.name;
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Player';
  }

  lineFor(playerId: string): MatchStats['playerStats'][number] {
    return (
      this.stats().playerStats.find((s) => s.playerId === playerId) ?? {
        playerId,
        teamId: '',
        points: 0,
        assists: 0,
        rebounds: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
      }
    );
  }

  add(playerId: string, teamId: string | undefined, type: MatchEventType): void {
    const matchId = this.match._id;
    if (!teamId) return;
    this.liveMatchService
      .addEvent(matchId, { playerId, teamId, type })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ stats }) => this.stats.set(stats));
  }

  undoLast(): void {
    const first = this.timeline()[0];
    if (!first?._id) return;
    this.liveMatchService
      .deleteEvent(first._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ stats }) => this.stats.set(stats));
  }
}

