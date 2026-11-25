import { Pipe, PipeTransform } from '@angular/core';

import { StageType } from '../data/stagetype.model';

/** The short names of the knockout rounds. */
const SHORT_NAMES: Record<string, string> = {
  Finale: 'FI',
  Halbfinale: 'HF',
  Viertelfinale: 'VF',
  Achtelfinale: 'AF',
  'Runde 3': 'R3',
  'Runde 2': 'R2',
  'Runde 1': 'R1',
};

@Pipe({ name: 'disciplineType' })
export class DisciplineTypePipe implements PipeTransform {
  transform(value: StageType | null | undefined): string | undefined {
    return value?.name == null ? undefined : SHORT_NAMES[value.name];
  }
}
