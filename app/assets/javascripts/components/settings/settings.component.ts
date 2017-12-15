import {Component} from "@angular/core"
import { SettingsService } from "../../services/settings.service";
import { StatusDto } from "../../data/status.dto";
import { ToastService } from "../../services/toast.service";


@Component({
  templateUrl:"assets/javascripts/views/settings/settings.component.html"
})
export class SettingsComponent{

    public printers: string[];
    public selectedPrinter: string;

    constructor(private settingsService:SettingsService, private toastService: ToastService) {
        settingsService.getAllPrinters().subscribe(this.onPrinterLoaded.bind(this));
    }

    onPrinterLoaded(result:string[]){
        this.printers = result;
    }

    onSaveClicked(){
        this.settingsService.setPrinter(this.selectedPrinter).subscribe(this.onPrinterSet.bind(this));
    }

    onPrinterSet(status: StatusDto){
        if(status.successful){
            this.toastService.toast("Drucker gespeichert");
            return;
        }
        this.toastService.toast(status.message);
    }
}