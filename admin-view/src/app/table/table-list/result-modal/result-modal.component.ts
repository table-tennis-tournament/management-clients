import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { ResultCheckerService } from './result-checker.service';
import { ResultCheckModel } from './result-check.model';
import { Match } from '../../../shared/data/match.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'toma-result-modal',
  templateUrl: './result-modal.component.html',
  styleUrls: ['./result-modal.component.scss'],
  standalone: false,
})
export class ResultModalComponent {
  checkerResult: ResultCheckModel = {
    firstPlayerWinning: false,
    secondPlayerWinning: false,
    currentResult: [],
  };

  currentInput: string;

  @ViewChild('answer', { read: ElementRef, static: false })
  private elementRef: ElementRef;

  constructor(
    private resultCheckerService: ResultCheckerService,
    public dialogRef: MatDialogRef<ResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public currentMatch: Match
  ) {
    this.setInputIfAvailable();
  }

  onKeyUp(value) {
    this.checkerResult = this.resultCheckerService.checkResult(value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getResult(): any {
    if (this.checkerResult.firstPlayerWinning || this.checkerResult.secondPlayerWinning) {
      return {
        result: this.checkerResult.currentResult,
        match: this.currentMatch,
      };
    }
  }

  resultNotValid(): boolean {
    return !this.checkerResult.firstPlayerWinning && !this.checkerResult.secondPlayerWinning;
  }

  private setInputIfAvailable() {
    const matchToSet = this.currentMatch;
    let resultString = '';
    if (matchToSet.result) {
      matchToSet.result.forEach((element) => {
        if (element[0] > element[1]) {
          resultString += element[1] + ' ';
        } else {
          resultString += '-' + element[0] + ' ';
        }
      });
      resultString = resultString.substr(0, resultString.length - 1);
      this.onKeyUp(resultString);
    }
    this.currentInput = resultString;
  }

  onEnter() {
    if (this.resultNotValid()) {
      return;
    }
    this.dialogRef.close(this.getResult());
  }
}
