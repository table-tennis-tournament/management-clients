import { Pipe, PipeTransform } from '@angular/core';

import { ShortNameMap } from '../../settings/settings.model';

/** The short name of a discipline where it has one, else its full name. */
@Pipe({ name: 'disciplineName' })
export class DisciplineNamePipe implements PipeTransform {
  transform(
    type: { id?: number; name?: string } | null | undefined,
    shortNames: ShortNameMap | null | undefined
  ): string {
    if (!type) {
      return '';
    }
    return shortNames?.[type.id] || type.name;
  }
}
