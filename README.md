# Cristore Sales App (React Native)

Android-first React Native sales app consuming the ERP OpenAPI backend with strict endpoint policy:

- GET endpoints implemented from the spec list
- POST allowed only for `/api/orders/create`
- No other POST/PUT/DELETE APIs are used in this codebase

## Stack

- React Native + TypeScript
- React Navigation
- Axios
- React Query + offline cache
- Zustand
- React Native Paper (light/dark themes)
- AsyncStorage
- ESC/POS printing (Bluetooth + Android POS)

## Project Structure

```text
src/
  api/
  components/
  screens/
  navigation/
  store/
  hooks/
  theme/
  services/
  printers/
  types/
  utils/
  constants/
```

## Implemented Modules

- Dashboard cards and quick actions
- Customers with collapsible branch tree selection
- Products with debounced fast search and category/subcategory chips
- Categories with expandable subcategory list
- Routes with route to customer filtering
- Orders list and order creation flow
- Receipt printing for 58mm/80mm

## Setup

1. Set API URL in `src/constants/config.ts`
2. Install deps:

```bash
npm install
```

3. Run Android app:

```bash
npx react-native run-android
```

## Notes

- Bluetooth and thermal printer libraries often need native Android configuration per vendor hardware.
- Validate final DTO fields against your exact OpenAPI schema in `erp_doc.txt` and adjust interfaces accordingly.
