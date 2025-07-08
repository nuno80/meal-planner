import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10 text-center">
        <h1 className="text-4xl font-bold">Welcome to MyApp</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          This is a responsive navigation bar with a night mode toggle.
        </p>
      </main>
    </div>
  );
}
