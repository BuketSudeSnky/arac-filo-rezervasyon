"use client";

import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react";

import {
  getUsers,
  type User,
} from "../../../api/services/userService";

type IconProps = SVGProps<SVGSVGElement>;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await getUsers();

        if (!Array.isArray(data)) {
          throw new Error(
            "Backend kullanıcı listesini beklenen formatta döndürmedi."
          );
        }

        if (!isCancelled) {
          setUsers(data);
        }
      } catch (error) {
        console.error("Kullanıcı yükleme hatası:", error);

        if (!isCancelled) {
          setUsers([]);

          setError(
            error instanceof Error
              ? error.message
              : "Kullanıcılar yüklenirken bir hata oluştu."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearchText = searchText
      .trim()
      .toLocaleLowerCase("tr-TR");

    return users
      .filter((user) => {
        const searchableText = [
          user.username,
          getRoleLabel(user.role),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr-TR");

        return (
          normalizedSearchText === "" ||
          searchableText.includes(normalizedSearchText)
        );
      })
      .sort((firstUser, secondUser) => {
        if (
          firstUser.role === "ADMIN" &&
          secondUser.role !== "ADMIN"
        ) {
          return -1;
        }

        if (
          firstUser.role !== "ADMIN" &&
          secondUser.role === "ADMIN"
        ) {
          return 1;
        }

        return firstUser.username.localeCompare(
          secondUser.username,
          "tr-TR"
        );
      });
  }, [users, searchText]);

  async function reloadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      if (!Array.isArray(data)) {
        throw new Error(
          "Backend kullanıcı listesini beklenen formatta döndürmedi."
        );
      }

      setUsers(data);
    } catch (error) {
      console.error("Kullanıcı yükleme hatası:", error);

      setUsers([]);

      setError(
        error instanceof Error
          ? error.message
          : "Kullanıcılar yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setSearchText("");
  }

  return (
    <section className="space-y-8">
      {/* Başlık */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Kullanıcı İşlemleri
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Kullanıcı Yönetimi
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Sisteme kayıtlı kullanıcıları görüntüleyin ve
          rollerini takip edin.
        </p>
      </div>

      {/* Arama alanı */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="user-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Kullanıcı Ara
        </label>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            id="user-search"
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Kullanıcı adı veya rol ara"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          />

          {searchText && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Aramayı temizle"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {!loading && !error && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Toplam{" "}
              <span className="font-semibold text-slate-950">
                {users.length}
              </span>{" "}
              kullanıcıdan{" "}
              <span className="font-semibold text-slate-950">
                {filteredUsers.length}
              </span>{" "}
              tanesi gösteriliyor.
            </p>

            {searchText.trim() !== "" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Arama uygulanıyor
              </span>
            )}
          </div>
        )}
      </div>

      {/* Kullanıcı tablosu */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && <UsersTableSkeleton />}

        {!loading && error && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertIcon className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Kullanıcılar yüklenemedi
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void reloadUsers()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshIcon className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredUsers.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <UsersIcon className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                {users.length === 0
                  ? "Henüz kullanıcı bulunmuyor"
                  : "Kullanıcı bulunamadı"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {users.length === 0
                  ? "Sisteme kayıtlı bir kullanıcı bulunmuyor."
                  : "Arama metnini değiştirerek tekrar deneyin."}
              </p>

              {searchText.trim() !== "" && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Aramayı Temizle
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">
                      Kullanıcı
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Rol
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-base font-bold uppercase text-amber-400">
                            {getUsernameInitial(
                              user.username
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-950">
                              {user.username ||
                                "Kullanıcı adı yok"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Kullanıcı No: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}

function RoleBadge({ role }: { role: string }) {
  const normalizedRole = role
    ?.trim()
    .toLocaleUpperCase("tr-TR");

  const isAdmin = normalizedRole === "ADMIN";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isAdmin
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-blue-200 bg-blue-50 text-blue-700"
      }`}
    >
      {isAdmin ? (
        <AdminIcon className="h-3.5 w-3.5" />
      ) : (
        <UserIcon className="h-3.5 w-3.5" />
      )}

      {isAdmin ? "Yönetici" : "Kullanıcı"}
    </span>
  );
}

function UsersTableSkeleton() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-6 py-5"
          >
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getRoleLabel(role: string) {
  const normalizedRole = role
    ?.trim()
    .toLocaleUpperCase("tr-TR");

  return normalizedRole === "ADMIN"
    ? "Yönetici"
    : "Kullanıcı";
}

function getUsernameInitial(username: string) {
  const normalizedUsername = username?.trim();

  if (!normalizedUsername) {
    return "?";
  }

  return normalizedUsername
    .charAt(0)
    .toLocaleUpperCase("tr-TR");
}

function SearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 4.5a4 4 0 0 1 0 7" />
      <path d="M17 14a6 6 0 0 1 5 6" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function AdminIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 9a7 7 0 0 1 11.5-2L20 12" />
      <path d="M17.9 15a7 7 0 0 1-11.5 2L4 12" />
    </svg>
  );
}

function AlertIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}