import { LayoutDashboard, User, Plus, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";


export default function DashboardHeader() {
    const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock data - replace with your actual props/state
  const clientInfo = { name: "John Doe" };
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "dashboard.title": "Dashboard",
      "dashboard.clientDashboard": "Manage your tickets and requests",
      "dashboard.newTicket": "New Ticket",
      "common.logout": "Logout"
    };
    return translations[key] || key;
  };

  const handleAddNew = () => {
    router.push("/support");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };
  

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t("dashboard.title")}
                </h1>
                <p className="text-sm text-gray-600">{t("dashboard.clientDashboard")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {clientInfo.name}
              </div>
              <Button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t("dashboard.newTicket")}
              </Button>
              <Button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                {t("common.logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}