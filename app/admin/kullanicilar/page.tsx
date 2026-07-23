"use client";

import { useMemo, useState } from "react";

const USERS = [
  {
    id: 1,
    fullName: "Ahmet Kaya",
    username: "ahmet",
    role: "Çalışan",
    status: "Aktif",
  },
  {
    id: 2,
    fullName: "Ayşe Demir",
    username: "ayse",
    role: "Çalışan",
    status: "Aktif",
  },
  {
    id: 3,
    fullName: "Admin",
    username: "admin",
    role: "Yönetici",
    status: "Aktif",
  },
];

export default function AdminUsersPage() {
  const [searchText, setSearchText] = useState("");

  const filteredUsers = useMemo(() => {
    return USERS.filter((user) =>
      `${user.fullName} ${user.username}`
        .toLocaleLowerCase("tr-TR")
        .includes(searchText.toLocaleLowerCase("tr-TR"))
    );
  }, [searchText]);

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Kullanıcı Yönetimi
          </h1>

          <p className="mt-1 text-gray-500">
            Sistemdeki kullanıcıları yönetin.
          </p>
        </div>

        <button className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#083a79]">
          + Yeni Kullanıcı
        </button>
      </div>

      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Ad Soyad</th>
              <th className="px-6 py-4 text-left">Kullanıcı Adı</th>
              <th className="px-6 py-4 text-left">Rol</th>
              <th className="px-6 py-4 text-left">Durum</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t"
              >
                <td className="px-6 py-4">
                  {user.fullName}
                </td>

                <td className="px-6 py-4">
                  {user.username}
                </td>

                <td className="px-6 py-4">
                  {user.role}
                </td>

                <td className="px-6 py-4">
                  {user.status}
                </td>

                <td className="px-6 py-4 text-right">
                  <button className="mr-2 rounded border border-[#0B4EA2] px-3 py-2 text-[#0B4EA2]">
                    Düzenle
                  </button>

                  <button className="rounded border border-red-500 px-3 py-2 text-red-600">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}