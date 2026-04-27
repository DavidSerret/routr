import { Navbar } from '@/components/ui/Navbar';
import { SearchForm } from '@/components/search/SearchForm';
import { Zap, SlidersHorizontal, CalendarDays } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Multi-airport search',
    description: 'Search across multiple origin and destination airports simultaneously to find the absolute best deal.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Advanced filters',
    description: 'Filter by layover duration, overnight stops, number of stops, airlines, and cabin class.',
  },
  {
    icon: CalendarDays,
    title: 'Price calendar',
    description: 'See prices across an entire month at a glance. Shift your dates by a day to save hundreds.',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="relative overflow-hidden pb-16 pt-20">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)',
            }}
          />

          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find flights{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  }}
                >
                  smarter
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#8888aa] sm:text-lg">
                Search multiple airports at once, filter by layover quality, and browse a full price calendar — all in one place.
              </p>
            </div>

            <div className="card-glass mx-auto max-w-5xl p-4 sm:p-6">
              <SearchForm />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card-glass p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366f1]/15">
                  <Icon className="h-5 w-5 text-[#6366f1]" />
                </div>
                <h3 className="font-display mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-[#8888aa]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
