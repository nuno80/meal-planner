// src/app/user-profile/[[...user-profile]]/page.tsx v.1.1
// Aggiunta la Navbar e un layout centrato.
// 1. Importiamo la Navbar
import { UserProfile } from "@clerk/nextjs";

import Navbar from "@/components/navbar";

const UserProfilePage = () => (
  <div>
    <Navbar /> {/* 2. Aggiungiamo la Navbar */}
    <main className="flex justify-center py-12">
      <UserProfile path="/user-profile" />
    </main>
  </div>
);

export default UserProfilePage;
