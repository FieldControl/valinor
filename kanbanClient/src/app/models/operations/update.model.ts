
export class UpdateModel {
  raw: any;
  affected?: number | null;
  generatedMaps: any[];

  constructor(raw: any, affected?: number | null, generatedMaps: any[] = []) {
    this.raw = raw;
    this.affected = affected;
    this.generatedMaps = generatedMaps;
  }
}
