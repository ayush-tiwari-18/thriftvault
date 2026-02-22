"use client"
import { useCart } from '@/context/CartContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function StoreConflictModal() {
  const { conflictProduct, setConflictProduct, forceAddToCart, cart } = useCart();

  if (!conflictProduct) return null;

  return (
    <AlertDialog open={!!conflictProduct} onOpenChange={() => setConflictProduct(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">Different Store</AlertDialogTitle>
          <AlertDialogDescription>
            Your cart contains items from <strong>{cart.storeName}</strong>. Each order can only include items from one store. Would you like to clear your cart and add this item instead?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConflictProduct(null)} className="bg-accent text-accent-foreground hover:bg-accent/90">Keep Current Cart</AlertDialogCancel>
          <AlertDialogAction onClick={() => forceAddToCart(conflictProduct)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Clear Cart & Add Item
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
