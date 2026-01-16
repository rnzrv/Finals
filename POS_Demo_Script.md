# Point of Sales (POS) System Demo Script

## Demo Overview
This script guides a live demonstration of the POS system. Assume the system is running on a local server (http://localhost:8081 for backend, React app on localhost:3000). The demo covers key features: browsing items, cart management, customer selection, PWD discount, calculations, and sale completion. Use sample data (e.g., products like "Paracetamol" ₱50, "Consultation" ₱200; customer "John Doe").

## Step-by-Step Demo Script

1. **Launch the Application**:
   - Open the browser and navigate to the POS page.
   - Log in (if required) and verify the sidebar and header load.
   - Narrate: "This is the Point of Sales system for managing retail transactions."

2. **Browse and Filter Items**:
   - Click "All" filter to show all products/services.
   - Switch to "Product" or "Services" to filter.
   - Use the search bar: Type "para" to filter to "Paracetamol".
   - Narrate: "Users can filter by category and search by name, code, or category for quick access."

3. **Add Items to Cart**:
   - Click on "Paracetamol" (₱50) to add to cart (quantity 1).
   - Add "Consultation" (₱200) twice (quantity 2).
   - Narrate: "Items are added to the cart with stock validation. Services have unlimited stock."

4. **Manage Cart**:
   - In the cart, increase "Paracetamol" quantity to 2.
   - Decrease "Consultation" to 1.
   - Remove "Paracetamol" using the X button.
   - Narrate: "Quantities can be adjusted, and items removed. Stock prevents over-ordering."

5. **Select Customer**:
   - In the customer section, search and select "John Doe" from the dropdown.
   - Narrate: "Customers are fetched from the database for personalized transactions."

6. **Apply PWD Discount**:
   - Click the "PWD" button.
   - Observe subtotal, tax (now 0), discount (20% of subtotal), and total update.
   - Narrate: "PWD applies VAT exemption and 20% discount on subtotal."

7. **Enter Payment and Calculate Change**:
   - Enter "500" in Total Payment.
   - Observe change calculation.
   - Narrate: "Change is calculated dynamically as payment is entered."

8. **Complete Sale**:
   - Click "Complete Sale" (Cash).
   - Confirm alert with reference number.
   - Narrate: "Sale data is sent to the backend, cart resets, and stock updates."

9. **Clear Cart and Logout**:
   - Add items again, then click "Clear Cart".
   - Click user icon to logout.
   - Narrate: "Cart can be cleared, and session ends securely."

## Demo Tips
- Use a projector for visibility.
- Prepare sample data in the backend.
- Highlight error handling (e.g., try insufficient payment).
- Time: 5-10 minutes.
- End with: "This demonstrates the system's efficiency for retail sales."

## List of Calculation Formulas
All formulas use JavaScript for precision; display with `toFixed(2)`.

1. **Subtotal**: `subtotal = cart.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * item.quantity), 0)`
   - Sum of (price × quantity) for cart items.

2. **Tax**: `tax = pwd ? 0 : subtotal * 0.1`
   - 10% VAT, 0 for PWD.

3. **Discount**: `discount = pwd ? subtotal * 0.2 : 0`
   - 20% on subtotal for PWD.

4. **Total**: `total = pwd ? subtotal - discount : subtotal + tax - discount`
   - Final amount; PWD excludes tax.

5. **Change**: `change = parseFloat(totalPayment) - total`
   - Payment minus total.

6. **PWD Toggle**: If !pwd, set discount = subtotal * 0.2, tax = 0; else reset to 0 and recalculate tax.
