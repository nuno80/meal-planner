import { Navbar } from "@/components/navbar";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10 text-center">
        <h1 className="text-4xl font-bold">Features</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Discover all the powerful features our platform has to offer.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg border p-6 text-left">
            <h3 className="text-xl font-bold">Responsive Design</h3>
            <p className="mt-2 text-muted-foreground">
              Our platform automatically adapts to any device, providing an
              optimal experience on desktop, tablet, and mobile.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg border p-6 text-left">
            <h3 className="text-xl font-bold">Dark Mode</h3>
            <p className="mt-2 text-muted-foreground">
              Switch between light and dark themes to reduce eye strain and
              improve readability in different lighting conditions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg border p-6 text-left">
            <h3 className="text-xl font-bold">Fast Performance</h3>
            <p className="mt-2 text-muted-foreground">
              Optimized for speed with next-generation technologies to ensure
              your experience is always smooth and responsive.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-lg border p-6 text-left">
            <h3 className="text-xl font-bold">Accessibility</h3>
            <p className="mt-2 text-muted-foreground">
              Built with accessibility in mind, ensuring everyone can use our
              platform regardless of abilities.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-lg border p-6 text-left">
            <h3 className="text-xl font-bold">Customization</h3>
            <p className="mt-2 text-muted-foreground">
              Tailor the interface to your preferences with extensive
              customization options and settings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-lg border p-6 text-left">
            <h3 className="text-xl font-bold">Regular Updates</h3>
            <p className="mt-2 text-muted-foreground">
              We continuously improve our platform with regular updates, new
              features, and security enhancements.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
