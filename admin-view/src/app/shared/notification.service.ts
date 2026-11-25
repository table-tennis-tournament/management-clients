import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationKind = 'error' | 'success' | 'info';

/** Short messages to the administrator, shown one at a time at the bottom of the screen. */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  public error(message: string): void {
    this.show(message, 'error');
  }

  public success(message: string): void {
    this.show(message, 'success');
  }

  public info(message: string): void {
    this.show(message, 'info');
  }

  private show(message: string, kind: NotificationKind): void {
    const config: MatSnackBarConfig = {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      politeness: kind === 'error' ? 'assertive' : 'polite',
      panelClass: `notification-${kind}`,
    };
    this.snackBar.open(message, undefined, config);
  }
}
