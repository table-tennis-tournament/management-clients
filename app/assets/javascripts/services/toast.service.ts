import {Injectable} from '@angular/core';
import {StatusDto} from '../data/status.dto';

declare var Materialize:any;

@Injectable()
export class ToastService {

  constructor() { }

  toast(text: string, duration: number = 2000, style: string = ""){
    Materialize.toast(text, duration, "toast-middle");
  }

  toastSuccess(){
    this.toast("Daten geladen.", 1000);
  }

  toastMessageOrShowStatus(status: StatusDto, message: string){
    if(status.successful){
      this.toast(message);
      return;
    }
    this.toast(status.message);
  }

}