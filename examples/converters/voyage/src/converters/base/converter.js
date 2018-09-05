/**
 * Abstract Converter class that all converts must implement
 */
export default class Converter {
  constructor() {
  }

  convertFrame(frame, xvizBuilder) {
    throw new Error('Implement me');
  }

  getMetadata(xvizMetaBuilder) {
    throw new Error('Implement me');
  }
}
