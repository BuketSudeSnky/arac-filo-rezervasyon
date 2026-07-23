export default function AdminPage() {
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Genel Bakış
        </h1>

        <p className="mt-1 text-gray-500">
          Filo durumunu ve rezervasyonları buradan takip edebilirsiniz.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Toplam Araç" value="18" />

        <DashboardCard title="Aktif Rezervasyon" value="7" />

        <DashboardCard title="Bakımdaki Araç" value="2" />

        <DashboardCard title="Toplam Kullanıcı" value="36" />
      </div>
    </section>
  );
}

type DashboardCardProps = {
  title: string;
  value: string;
};

function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#0B4EA2]">
        {value}
      </p>
    </div>
  );
}