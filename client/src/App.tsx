import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "./components/layout";

// Pages
import { OrdersList } from "./pages/orders-list";
import { OrderForm } from "./pages/order-form";
import { OrderDetails } from "./pages/order-details";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={OrdersList} />
        <Route path="/orders/new" component={OrderForm} />
        <Route path="/orders/:id/edit" component={OrderForm} />
        <Route path="/orders/:id" component={OrderDetails} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
