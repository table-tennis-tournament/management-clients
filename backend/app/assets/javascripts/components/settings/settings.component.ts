import {Component, state} from "@angular/core"
import { SettingsService } from "../../services/settings.service";
import { StatusDto } from "../../data/status.dto";
import { ToastService } from "../../services/toast.service";
import { SettingDto } from "../../data/setting.dto";


@Component({
  templateUrl:"assets/javascripts/views/settings/settings.component.html"
})
export class SettingsComponent{

    public printers: string[];
    public selectedPrinter: string;
    public isPrintForAssign: boolean;
    public assignAutomatically: boolean;

    constructor(private settingsService:SettingsService, private toastService: ToastService) {
        this.settingsService.getAllPrinters().subscribe(this.onPrinterLoaded.bind(this));
    }

    onPrinterLoaded(result:string[]){
        this.printers = result;
        this.settingsService.getAllSettings().subscribe(this.onSettingsLoaded.bind(this));
    }

    onSettingsLoaded(settings: SettingDto[]){
        var that = this;
        settings.forEach(setting => {
            if(setting.key === "printerName"){
                that.selectedPrinter = setting.value;
            }
            if(setting.key === "alwaysPrint"){
                that.isPrintForAssign = setting.value;
            }
        });
        this.toastService.toast("Einstellungen geladen");
    }

    onSaveClicked(){
        this.settingsService.setPrinter(this.selectedPrinter).subscribe(this.onPrinterSet.bind(this));
    }

    onIsPrintForAssignChange(){
        this.settingsService.setIsPrintForAssign(this.isPrintForAssign).subscribe(this.onSetPrintForAssignComplete.bind(this));
    }

    onAutomaticallyAssign(){
        this.settingsService.setMatchlistActive(this.assignAutomatically).subscribe(this.onAutomaticAssign.bind(this));
    }


    onSetPrintForAssignComplete(status: StatusDto){
        this.printSuccessOrMessage(status, "Druck bei Ausruf gespeichert");
    }

    onPrinterSet(status: StatusDto){
        this.printSuccessOrMessage(status, "Drucker gespeichert");
    }

    onAutomaticAssign(status: StatusDto){
        this.printSuccessOrMessage(status, "Warteliste automatisch gespeichert");
    }

   
    

    printSuccessOrMessage(status: StatusDto, message: string){
        if(status.successful){
            this.toastService.toast(message);
            return;
        }
        this.toastService.toast(status.message);
    }
}