import { useOrders, useDeleteOrder } from "@/hooks/use-orders";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, ChevronRight, Search, FileX, Trash2, Edit2, Loader2 } from "lucide-react";
import { useState } from "react";

export function OrdersList() {
  const { data: orders, isLoading, error } = useOrders();
  const deleteOrder = useDeleteOrder();
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const filteredOrders = orders?.filter(o => 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage and track your customer orders.</p>
        </div>
        <Link 
          href="/orders/new" 
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-lg shadow-black/5 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-border/60 shadow-sm focus-ring text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 flex flex-col items-center text-center">
          <FileX className="w-8 h-8 mb-2 opacity-80" />
          <p className="font-semibold">Failed to load orders</p>
          <p className="text-sm opacity-80 mt-1">Please try refreshing the page.</p>
        </div>
      )}

      {!isLoading && !error && filteredOrders?.length === 0 && (
        <div className="bg-white border border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
            <FileX className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No orders found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm ? "No orders matched your search criteria." : "You haven't created any orders yet. Start by creating your first one."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders?.map((order) => (
          <div 
            key={order.orderId}
            className="group bg-white rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1 block">Order ID</span>
                <h3 className="font-display font-bold text-lg text-foreground truncate max-w-[200px]" title={order.orderId}>
                  {order.orderId}
                </h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/orders/${order.orderId}/edit`} className="p-2 text-muted-foreground hover:text-primary hover:bg-zinc-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to delete this order?')) {
                      deleteOrder.mutate(order.orderId);
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={deleteOrder.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="font-medium text-foreground">{formatCurrency(order.value)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {format(new Date(order.creationDate), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium text-foreground">
                  {order.items?.length || 0} product(s)
                </span>
              </div>
            </div>

            <Link 
              href={`/orders/${order.orderId}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors mt-auto"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
