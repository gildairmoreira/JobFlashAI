import { getAdminDashboardData, getGlobalSettings } from "./actions";
import AdminPanelTabs from "./AdminPanelTabs";
import UserDirectory from "./UserDirectory";
import RevenueReport from "./RevenueReport";
import SettingsPanel from "./SettingsPanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const { 
        stats, 
        recentUsers, 
        adminRole, 
        revenueHistory, 
        funnelData, 
        lastPaidSales 
    } = await getAdminDashboardData();

    const globalSettings = await getGlobalSettings();

    return (
        <AdminPanelTabs 
            adminRole={adminRole || "USER"}
            stats={stats}
            userDirectory={
                <UserDirectory 
                    stats={stats as any} 
                    recentUsers={recentUsers} 
                    adminRole={adminRole || "USER"} 
                />
            }
            revenueReport={
                <RevenueReport 
                    stats={stats as any}
                    revenueHistory={revenueHistory as any}
                    funnelData={funnelData as any}
                    lastPaidSales={lastPaidSales as any}
                />
            }
            settingsPanel={<SettingsPanel settings={globalSettings} />}
        />
    );
}
