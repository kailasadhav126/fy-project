import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SOSModal from "@/components/sos-modal";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";
import MyBookings from "@/pages/my-bookings";
import TransportToCity from "@/pages/transport-to-city";
import TransportInCity from "@/pages/transport-in-city";
import TransportRoadGoogle from "@/pages/transport-road-google";
import TransportBus from "@/pages/transport-bus-enhanced";
import TransportTrain from "@/pages/transport-train-enhanced";
import TransportCab from "@/pages/transport-cab-enhanced";
import TransportBusBooking from "@/pages/transport-bus-to-city-booking";
import TransportTrainBooking from "@/pages/transport-train-booking";
import TransportCabBooking from "@/pages/transport-cab-booking";
import HotelBooking from "@/pages/hotel-booking";
import Parking from "@/pages/parking";
import MedicalServices from "@/pages/medical-services";
import Navigation from "@/pages/navigation";
import NavigationZones from "@/pages/navigation-zones";
import WalkingRoutes from "@/pages/walking-routes";
import CityBus from "@/pages/city-bus";
import ShuttleServices from "@/pages/shuttle-services";
import CompleteNavigation from "@/pages/complete-navigation";
import TransportTesting from "@/pages/transport-testing";
import SectorDistribution from "@/pages/sector-distribution";
import SectorDetail from "@/pages/sector-detail";
import ParkingDetail from "@/pages/parking-detail";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  const handleSOSClick = () => {
    setIsSOSModalOpen(true);
  };

  const handleCloseSOSModal = () => {
    setIsSOSModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSOSClick={handleSOSClick} />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={() => <Home onSOSClick={handleSOSClick} />} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-bookings" component={MyBookings} />
          <Route path="/transport/to-city" component={TransportToCity} />
          <Route path="/transport/in-city" component={TransportInCity} />
          <Route path="/transport/road" component={TransportRoadGoogle} />
                <Route path="/transport/bus" component={TransportBus} />
                <Route path="/transport/bus-booking" component={TransportBusBooking} />
                <Route path="/transport/train" component={TransportTrain} />
                <Route path="/transport/train-booking" component={TransportTrainBooking} />
                <Route path="/transport/cab" component={TransportCab} />
                <Route path="/transport/cab-booking" component={TransportCabBooking} />
                <Route path="/hotel-booking" component={HotelBooking} />
                <Route path="/parking" component={Parking} />
                <Route path="/medical-services" component={MedicalServices} />
                <Route path="/navigation" component={NavigationZones} />
                <Route path="/navigation-old" component={Navigation} />
                <Route path="/walking-routes" component={WalkingRoutes} />
                <Route path="/citybus" component={CityBus} />
                <Route path="/shuttleservices" component={ShuttleServices} />
                <Route path="/complete-navigation" component={CompleteNavigation} />
                <Route path="/transport/testing" component={TransportTesting} />
                <Route path="/sector-distribution" component={SectorDistribution} />
                <Route path="/sector/:id" component={SectorDetail} />
                <Route path="/parking-detail/:parkingName" component={ParkingDetail} />
                <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <SOSModal isOpen={isSOSModalOpen} onClose={handleCloseSOSModal} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
