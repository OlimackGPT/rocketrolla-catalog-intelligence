export default function Home() {
  return <div className="grid gap-4 md:grid-cols-3">{['Artists onboarded','Catalogs analyzed','Partner matches'].map((k, i) => <div key={k} className="card"><p className="text-slate-400">{k}</p><p className="text-3xl font-bold">{[12,48,31][i]}</p></div>)}</div>;
}
