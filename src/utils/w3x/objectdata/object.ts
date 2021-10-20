import Modification from '../../../parsers/w3x/w3u/modification';
import { OEContainer } from './containers';

export abstract class OEObject {
  parent: OEContainer<OEObject>;
  oldId: string;
  newId: string;
  modifications = new Map<string, string>();

  constructor(parent: OEContainer<OEObject>, oldId: string, newId: string, modifications: Modification[]) {
    this.parent = parent;
    this.oldId = oldId;
    this.newId = newId;

    for (const modification of modifications) {
      let value = modification.value;

      if (typeof value !== 'string') {
        value = value.toString();
      }

      this.modifications.set(modification.id, value);
    }
  }

  string(id: string): string {
    let value = this.modifications.get(id);

    if (value === undefined) {
      const row = this.parent.data.getRow(this.oldId);
      const name = this.parent.metaData.getProperty(id, 'field');
      
      value = row.string(name);

      if (value === undefined) {
        return '_';
      }
    }

    if (value === '-' || value === ' - ') {
      return '_';
    }

    return value;
  }

  number(id: string): number {
    const number = parseFloat(this.string(id));

    if (isNaN(number)) {
      return 0;
    }

    return number;
  }

  boolean(id: string): boolean {
    const string = this.string(id);

    if (string === '1' || string === 'TRUE') {
      return true;
    }

    return false;
  }

  set(id: string, value: string | number | boolean | undefined): void {
    if (value === undefined) {
      this.modifications.delete(id);
    } else {
      if (value === true) {
        value = '1';
      } else if (value === false) {
        value = '0';
      } else if (typeof value !== 'string') {
        value = value.toString();
      }

      this.modifications.set(id, value);  
    }
  }
}