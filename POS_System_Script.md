# Point of Sales (POS) System Script for Defense

## Introduction

The Point of Sales (POS) system is a React-based web application designed for managing retail sales transactions in a healthcare or general store environment. It allows users to:

- Browse and filter products/services (e.g., medicines, consultations).
- Add items to a cart with quantity management and stock validation.
- Select customers from a database.
- Apply discounts for Persons With Disabilities (PWD), including VAT exemption and 20% discount.
- Process payments via Cash, Card, or GCash, with dynamic change calculation.
- Complete sales and send data to a backend server (running on http://localhost:8081).

Key features include real-time stock tracking, search/filter functionality, and responsive UI. The system ensures accurate pricing, handles edge cases like out-of-stock items, and resets states after transactions.

## Key Components and Flow

1. **Data Fetching**: Retrieves POS items and customers from the server using Axios and JWT tokens.
2. **Filtering and Search**: Filters items by category (All, Product, Services) and searches by name, code, or category.
3. **Cart Management**: Adds/removes items, updates quantities with stock checks.
4. **Customer Selection**: Dropdown with search for selecting customers.
5. **Calculations**: Handles subtotal, tax, discount, total, and change.
6. **Payment Processing**: Validates payment, completes sale, and resets cart.
7. **PWD Discount**: Toggles VAT exemption and 20% discount on subtotal.

## Calculations and Formulas

All calculations use JavaScript's `Number` for precision and `toFixed(2)` for display. Formulas are based on cart items, PWD status, and payment input.

1. **Subtotal Calculation**:

   - Formula: `subtotal = cart.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * item.quantity), 0)`
   - Purpose: Sum of (selling price × quantity) for all cart items.
   - Example: If cart has 2 items (₱100 × 1, ₱50 × 2), subtotal = 100 + 100 = ₱200.

2. **Tax Calculation**:

   - Formula: `tax = pwd ? 0 : subtotal * 0.1`
   - Purpose: 10% VAT on subtotal; exempted (0) for PWD.
   - Example: Non-PWD subtotal ₱200 → tax = 20; PWD → tax = 0.

3. **Discount Calculation**:

   - Formula: `discount = pwd ? subtotal * 0.2 : 0`
   - Purpose: 20% discount on subtotal for PWD; 0 otherwise.
   - Example: PWD subtotal ₱200 → discount = 40; Non-PWD → discount = 0.

4. **Total Calculation**:

   - Formula: `total = pwd ? subtotal - discount : subtotal + tax - discount`
   - Purpose: Final amount due. PWD excludes tax; others include tax and subtract discount if any.
   - Example: Non-PWD (subtotal ₱200, tax ₱20, discount 0) → total = 200 + 20 = ₱220.
   - PWD (subtotal ₱200, discount ₱40) → total = 200 - 40 = ₱160.

5. **Change Calculation**:

   - Formula: `change = parseFloat(totalPayment) - total`
   - Purpose: Amount to return after payment.
   - Example: Total ₱220, payment ₱250 → change = 30.

6. **PWD Toggle Logic** (in `handlePWDDiscount`):
   - If not PWD: Set `pwd = true`, `discount = subtotal * 0.2`, `tax = 0`, recalculate total.
   - If PWD: Set `pwd = false`, `discount = 0`, `tax = subtotal * 0.1`, recalculate total.
   - Resets on cart clear or sale completion.

## Additional Notes for Defense

- **Stock Validation**: Prevents adding items beyond available stock (except services, which are infinite).
- **Error Handling**: Alerts for insufficient payment, out-of-stock, or API failures.
- **State Management**: Uses React hooks (useState, useEffect) for cart, filters, and calculations.
- **Backend Integration**: Sends sale data (subtotal, tax, discount, total, items) to server for persistence.
- **UI Elements**: Displays subtotal, tax, discount, total, payment, and change in real-time.

This script covers the core logic; refer to `pointofSales.jsx` for implementation details.
