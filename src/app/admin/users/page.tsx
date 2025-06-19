"use client";

import { useEffect, useState } from "react";

// import { useUser } from "@clerk/nextjs"; // RIMOSSO

interface User {
  id: string;
  primaryEmailAddress?: { emailAddress: string }; // Adattato alla struttura tipica di Clerk
  publicMetadata: {
    role?: string;
  };
  // Aggiungi altri campi se necessari dalla tua API
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/get-users");
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      // La struttura effettiva degli utenti da Clerk API potrebbe essere data.users o solo data
      // Adatta in base alla tua API /api/admin/get-users
      setUsers(data.users || data);
    } catch (err) {
      console.error("Error loading users:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while loading users.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, role: string) {
    setError(null);
    try {
      const response = await fetch("/api/admin/set-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      if (response.ok) {
        loadUsers(); // Ricarica gli utenti per mostrare il ruolo aggiornato
      } else {
        const errorData = await response.json().catch(() => ({
          message: `Failed to update role: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `Failed to update role: ${response.statusText}`
        );
      }
    } catch (err) {
      console.error("Error updating user role:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while updating the user role.");
      }
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <div>Caricamento utenti...</div>;
  if (error) return <div style={{ color: "red" }}>Errore: {error}</div>;

  return (
    <div>
      <h1>Gestione Utenti</h1>
      {users.length === 0 && !loading && <p>Nessun utente trovato.</p>}
      {users.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Ruolo Attuale</th>
              <th>Imposta Ruolo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.primaryEmailAddress?.emailAddress || "N/A"}</td>
                <td>{user.publicMetadata?.role || "Nessuno"}</td>
                <td>
                  <select
                    value={user.publicMetadata?.role || ""}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                  >
                    <option value="">Seleziona Ruolo</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>{" "}
                    {/* Allineato con tasks.json */}
                    {/* Aggiungi altri ruoli se necessario, es. "moderator" se lo usi */}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
