import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {LoadSettingsError, LoadSettingsSuccess, SettingsActionTypes} from './settings.actions';
import {SettingsService} from '../settings.service';

@Injectable()
export class SettingsEffects {

    @Effect()
    loadSettings$: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.Load),
        mergeMap(() => {
            return this.settingsService
                .loadSettings().pipe(
                    map(settings => new LoadSettingsSuccess(settings)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Settings', 'Error');
                        return of(new LoadSettingsError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private settingsService: SettingsService) {

    }

}
