import {
    allSchemas,
    allCollections,
    importedSchemas,
    importedCollections,
    commonSchemas,
    commonCollections,
    collectionNamesByName,
  } from './model_constants';
  
  describe('model_constants', () => {
    it('allSchemas and allCollections', () => {
      expect(allSchemas.length).toBe(importedSchemas.length + commonSchemas.length);
      expect(allCollections.length).toBe(importedCollections.length + commonCollections.length);
  
      allSchemas.forEach((schema, index) => {
        if (index < importedSchemas.length) {
          expect(schema).toBe(importedSchemas[index]);
        } else {
          expect(schema).toBe(commonSchemas[index - importedSchemas.length]);
        }
      });
  
      allCollections.forEach((collection, index) => {
        if (index < importedCollections.length) {
          expect(collection).toBe(importedCollections[index]);
        } else {
          expect(collection).toBe(commonCollections[index - importedCollections.length]);
        }
      });
    });
  
    it('collectionNamesByName', () => {
      allSchemas.forEach((schema) => {
        expect(collectionNamesByName[schema]).toBeDefined();
        const collection = collectionNamesByName[schema];
        expect(allCollections).toContain(collection);
      });
    });
  });
  