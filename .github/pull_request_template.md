## Summary

- Describe the user-facing or structural change.

## Validation

- [ ] `npm run check`
- [ ] `npm run build`

## Structure checklist

- [ ] New work lives in the correct `client/src/features/*` folder
- [ ] Route files in `client/src/pages` stay thin
- [ ] Shared payload contracts reuse `shared/schema.ts` where applicable
- [ ] New data access is isolated to feature-local helpers instead of inline page logic
