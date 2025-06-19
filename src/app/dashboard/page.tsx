import { currentUser } from "@clerk/nextjs/server";
import { Activity, BarChart, DollarSign, Users } from "lucide-react";

// Opzionale: per salutare l'admin
import { Navbar } from "@/components/navbar";

// Icone per un look migliore

// --- Dati Mock ---
const mockKpiData = [
  {
    id: 1,
    title: "Utenti Registrati",
    value: "1,234",
    icon: Users,
    change: "+5% ultimi 7g",
  },
  {
    id: 2,
    title: "Entrate Mensili",
    value: "€ 8,765",
    icon: DollarSign,
    change: "+12% mese prec.",
  },
  {
    id: 3,
    title: "Ordini Recenti",
    value: "56",
    icon: Activity,
    change: "-2% ieri",
  },
  {
    id: 4,
    title: "Sessioni Attive",
    value: "78",
    icon: BarChart,
    change: "+8% ultima ora",
  },
];

const mockRecentActivities = [
  { id: 1, user: "Mario Rossi", action: "si è registrato", time: "2 ore fa" },
  {
    id: 2,
    user: "Luigi Verdi",
    action: "ha effettuato un ordine (#123)",
    time: "3 ore fa",
  },
  {
    id: 3,
    user: "Peach Gialli",
    action: "ha aggiornato il profilo",
    time: "5 ore fa",
  },
  {
    id: 4,
    user: "Admin User",
    action: "ha effettuato l'accesso",
    time: "1 giorno fa",
  },
];

const mockTopProducts = [
  { id: 101, name: "Prodotto A", sales: 150, revenue: "€ 1,500" },
  { id: 102, name: "Prodotto B", sales: 120, revenue: "€ 2,400" },
  { id: 103, name: "Prodotto C", sales: 95, revenue: "€ 950" },
  { id: 104, name: "Prodotto D", sales: 80, revenue: "€ 1,200" },
];
// --- Componente Pagina ---

export default async function DashboardPage() {
  // Opzionale: Recupera l'utente corrente per un saluto personalizzato
  const user = await currentUser();
  const adminFirstName = user?.firstName || "Admin";

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Dashboard Amministrazione
          {adminFirstName && (
            <span className="text-xl font-normal">
              , Benvenuto {adminFirstName}!
            </span>
          )}
        </h1>

        {/* Sezione KPI */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockKpiData.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">
                  {kpi.title}
                </h2>
                <kpi.icon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mb-1 text-3xl font-semibold">{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Sezione Attività Recenti e Prodotti Top */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Attività Recenti */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Attività Recenti</h2>
            <ul className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Placeholder Grafico / Prodotti Top */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Prodotti Top</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">
                      Prodotto
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-600">
                      Vendite
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-600">
                      Entrate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockTopProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.sales}</td>
                      <td className="px-4 py-2">{product.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Altri Contenuti Placeholder */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-md">
          <p>Area per altri grafici o report...</p>
          {/* Qui potresti inserire componenti per grafici reali (es. usando Recharts, Chart.js) */}
        </div>
      </div>
    </div>
  );
}
