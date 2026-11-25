import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let open: Mock;
  let service: NotificationService;

  beforeEach(() => {
    open = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: { open } }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('shows an error assertively with the error panel class', () => {
    service.error('Fehler beim Laden der Tische');

    expect(open.mock.calls).toEqual([
      [
        'Fehler beim Laden der Tische',
        undefined,
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          politeness: 'assertive',
          panelClass: 'notification-error',
        },
      ],
    ]);
  });

  it('shows a success politely with the success panel class', () => {
    service.success('Kurzname gespeichert');

    expect(open.mock.calls).toEqual([
      [
        'Kurzname gespeichert',
        undefined,
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          politeness: 'polite',
          panelClass: 'notification-success',
        },
      ],
    ]);
  });

  it('shows an info politely with the info panel class', () => {
    service.info('In Warteliste eingefügt');

    expect(open.mock.calls).toEqual([
      [
        'In Warteliste eingefügt',
        undefined,
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          politeness: 'polite',
          panelClass: 'notification-info',
        },
      ],
    ]);
  });
});
