import { Pipe, PipeTransform } from "@angular/core";
import { Player } from "./match/player.model";

@Pipe({
  name: "playerName",
  standalone: false,
})
export class PlayerNamePipe implements PipeTransform {
  transform(value: Player[], ...args: any[]): any {
    if (value && value.length === 1) {
      return value[0].first_name + " " + value[0].last_name;
    }
    if (value && value.length === 2) {
      return this.getShortForm(value[0]) + " / " + this.getShortForm(value[1]);
    }
  }

  private getShortForm(value: Player) {
    return value.last_name + " " + value.first_name.substring(0, 3) + ".";
  }
}
