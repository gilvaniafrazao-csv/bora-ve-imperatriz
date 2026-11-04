"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ChevronDown, Crosshair, List, Loader2,
  Map, MapPin, Search, UserPlus, X,
} from "lucide-react";

export type MapPlace = {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
};

export type MapLocation =
  | { type: "current"; label: string; latitude: number; longitude: number }
  | { type: "search"; label: string; query: string; latitude?: number; longitude?: number };

type MapPageProps = {
  places?: MapPlace[];
  loading?: boolean;
  error?: string | null;
  locationStatus?: "idle" | "denied" | "unavailable" | "ready";
  selectedPlaceId?: string | null;
  onSelectedPlaceChange?: (placeId: string) => void;
  onSelectPlace?: (place: MapPlace) => void;
  onLocationChange?: (location: MapLocation) => void;
  onLocationSearch?: (query: string) => void;
  mapContent?: ReactNode;
};

const demoPlaces: MapPlace[] = [
  { id: "1", name: "Pizzaria Nostra", category: "Restaurantes", description: "Pizzas artesanais e ambiente aconchegante." },
  { id: "2", name: "Café da Praça", category: "Cafeterias", description: "Cafés especiais, doces e opções para o fim da tarde." },
  { id: "3", name: "Varanda 51", category: "Bares", description: "Drinks, música e gastronomia para aproveitar a noite." },
  { id: "4", name: "Espaço Cultural", category: "Cultura", description: "Arte e programação cultural." },
];

export function MapaClient({
  places = demoPlaces,
  loading = false,
  error = null,
  locationStatus = "idle",
  selectedPlaceId,
  onSelectedPlaceChange,
  onSelectPlace,
  onLocationChange,
  onLocationSearch,
  mapContent,
}: MapPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"lista" | "mapa">("lista");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationLabel, setLocationLabel] = useState("Imperatriz, MA");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [localLocationStatus, setLocalLocationStatus] = useState<"idle" | "denied" | "unavailable" | "ready">("idle");

  const activeSelectedId = selectedPlaceId !== undefined ? selectedPlaceId : selectedId;
  const activeLocationStatus = localLocationStatus !== "idle" ? localLocationStatus : locationStatus;
  const hasDistanceData = places.some(
    (place) => typeof place.distanceKm === "number" && Number.isFinite(place.distanceKm)
  );
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(places.map((place) => place.category)))],
    [places]
  );

  const filteredPlaces = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return places
      .filter((place) =>
        (category === "Todos" || place.category === category) &&
        (!term || [place.name, place.category, place.description, place.address].some(
          (value) => value?.toLocaleLowerCase("pt-BR").includes(term)
        ))
      )
      .sort((a, b) => {
        if (hasDistanceData) {
          const distanceA = typeof a.distanceKm === "number" && Number.isFinite(a.distanceKm) ? a.distanceKm : Infinity;
          const distanceB = typeof b.distanceKm === "number" && Number.isFinite(b.distanceKm) ? b.distanceKm : Infinity;
          if (distanceA !== distanceB) return distanceA - distanceB;
        }
        return a.name.localeCompare(b.name, "pt-BR");
      });
  }, [places, category, search, hasDistanceData]);

  const selectedPlace = places.find((place) => place.id === activeSelectedId) ?? null;

  function selectPlace(place: MapPlace) {
    setSelectedId(place.id);
    onSelectedPlaceChange?.(place.id);
    onSelectPlace?.(place);
    setMobileView("mapa");
  }

  function useCurrentLocation() {
    setLocationMessage(null);
    if (!navigator.geolocation) {
      setLocalLocationStatus("unavailable");
      setLocationMessage("Seu navegador não oferece acesso à localização. Pesquise uma região abaixo.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setLocalLocationStatus("ready");
        setLocationLabel("Perto de mim");
        setLocationOpen(false);
        setLocationQuery("");
        setLocationMessage(null);
        onLocationChange?.({
          type: "current",
          label: "Perto de mim",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        setLocating(false);
        const denied = geoError.code === 1;
        setLocalLocationStatus(denied ? "denied" : "unavailable");
        setLocationMessage(denied
          ? "Localização não autorizada. Você pode pesquisar um bairro ou ponto de referência."
          : "Não foi possível obter sua localização. Tente pesquisar uma região.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function submitLocationSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = locationQuery.trim();
    if (query.length < 2) {
      setLocationMessage("Digite pelo menos dois caracteres para pesquisar.");
      return;
    }
    onLocationSearch?.(query);
    setLocationMessage("Busca de regiões preparada. As sugestões e a confirmação do local serão conectadas à API de mapas.");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <section className="bg-[#0b3f45] text-white">
        <header className="mx-auto flex min-h-[88px] w-full max-w-[1440px] items-center gap-3 px-4 md:min-h-[78px] md:gap-6 md:px-6 lg:px-14">
          <Link href="/home" className="shrink-0">
            <img src="/logo.svg" alt="Bora Vê" className="h-auto w-[105px] sm:w-[120px] lg:w-[145px]" />
          </Link>
          <form onSubmit={(event) => event.preventDefault()} className="hidden h-10 min-w-0 flex-1 items-center rounded-full border border-white/10 bg-white/10 px-4 md:flex lg:max-w-[550px]">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="O que você quer fazer hoje? Restaurantes, eventos..." aria-label="Buscar lugares" className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/55" />
            <button type="submit" className="rounded-full bg-[#dfff00] px-4 py-1.5 text-xs font-bold text-[#0b3f45]">Buscar</button>
          </form>
          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            <Link href="/home" className="text-xs font-semibold hover:text-[#dfff00]">Início</Link>
            <Link href="/explorar?tipo=lugares" className="text-xs font-semibold text-[#dfff00]">Lugares</Link>
            <Link href="/explorar?tipo=eventos" className="text-xs font-semibold hover:text-[#dfff00]">Eventos</Link>
            <span className="h-5 w-px bg-white/20" />
            <Link href="/login" className="text-xs font-bold hover:text-[#dfff00]">Entrar</Link>
            <Link href="/cadastro" className="flex h-10 items-center gap-2 rounded-full bg-[#dfff00] px-5 text-xs font-black text-[#0b3f45]"><UserPlus size={14} />Criar Conta</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <Link href="/login" className="text-xs font-semibold">Entrar</Link>
            <Link href="/cadastro" className="rounded-full bg-[#dfff00] px-3 py-2 text-xs font-bold text-[#0b3f45]">Criar Conta</Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 pb-4 md:hidden">
          <label className="flex h-11 items-center gap-3 rounded-full bg-white/10 px-4">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lugares..." aria-label="Buscar lugares" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60" />
          </label>
        </div>
      </section>

      <section className="border-b border-[#0b3f45]/10 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 lg:px-14">
          <Link href="/explorar?tipo=lugares" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b3f45]"><ArrowLeft size={16} />Voltar para Explorar</Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0b3f45]/60">Descubra a cidade</p>
              <h1 className="mt-2 text-2xl font-extrabold text-[#0b3f45] sm:text-3xl">Explore lugares no mapa</h1>
              <p className="mt-2 text-sm text-[#0b3f45]/65">Encontre um lugar que combina com seus planos.</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <button type="button" onClick={() => { setLocationOpen((current) => !current); setLocationMessage(null); }} aria-expanded={locationOpen} aria-controls="location-panel" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#eaf1ef] px-4 py-2.5 text-xs font-semibold text-[#0b3f45] transition hover:bg-[#dcebe6] sm:w-auto">
                <MapPin size={16} />{locationLabel}<ChevronDown size={15} className={locationOpen ? "rotate-180" : ""} />
              </button>
              {locationOpen && (
                <div id="location-panel" className="relative z-20 mt-3 w-full rounded-2xl border border-[#0b3f45]/10 bg-white p-4 shadow-xl sm:absolute sm:right-0 sm:w-[350px]">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-[#0b3f45]">Onde você quer explorar?</h2>
                    <button type="button" onClick={() => setLocationOpen(false)} aria-label="Fechar seletor de localização" className="rounded-full p-2 text-[#0b3f45] hover:bg-[#edf2f0]"><X size={17} /></button>
                  </div>
                  <button type="button" onClick={useCurrentLocation} disabled={locating} className="mt-4 flex w-full items-center gap-3 rounded-xl bg-[#eaf1ef] p-4 text-left text-[#0b3f45] transition hover:bg-[#dcebe6] disabled:opacity-60">
                    {locating ? <Loader2 size={21} className="shrink-0 animate-spin" /> : <Crosshair size={21} className="shrink-0" />}
                    <span><span className="block text-sm font-bold">{locating ? "Obtendo localização..." : "Usar minha localização atual"}</span><span className="mt-1 block text-xs text-[#0b3f45]/65">Encontrar lugares perto de mim</span></span>
                  </button>
                  <form onSubmit={submitLocationSearch} className="mt-5">
                    <label htmlFor="location-query" className="block text-xs font-semibold text-[#0b3f45]">Ou pesquise uma região</label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#0b3f45]/15 px-3">
                      <Search size={17} className="shrink-0 text-[#0b3f45]/60" />
                      <input id="location-query" value={locationQuery} onChange={(event) => { setLocationQuery(event.target.value); setLocationMessage(null); }} placeholder="Bairro, rua ou ponto de referência" className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#0b3f45] outline-none" />
                    </div>
                    <p className="mt-2 text-xs text-[#0b3f45]/55">Ex.: Centro, Beira Rio ou IFMA Imperatriz.</p>
                    <button type="submit" className="mt-3 w-full rounded-xl bg-[#0b3f45] px-4 py-3 text-sm font-bold text-white hover:bg-[#12616a]">Pesquisar região</button>
                  </form>
                  {locationMessage && <p role="status" className="mt-3 rounded-lg bg-[#f1f7f5] p-3 text-xs leading-5 text-[#0b3f45]">{locationMessage}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1440px] gap-2 px-4 pt-5 lg:hidden">
        <button type="button" onClick={() => setMobileView("lista")} aria-pressed={mobileView === "lista"} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${mobileView === "lista" ? "bg-[#0b3f45] text-white" : "border border-[#0b3f45]/15 bg-white text-[#0b3f45]"}`}><List size={17} />Lista</button>
        <button type="button" onClick={() => setMobileView("mapa")} aria-pressed={mobileView === "mapa"} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${mobileView === "mapa" ? "bg-[#0b3f45] text-white" : "border border-[#0b3f45]/15 bg-white text-[#0b3f45]"}`}><Map size={17} />Mapa</button>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-5 md:px-6 lg:grid-cols-[370px_minmax(0,1fr)] lg:px-14">
        <aside className={`min-w-0 overflow-hidden rounded-2xl border border-[#0b3f45]/10 bg-white lg:block ${mobileView === "mapa" ? "hidden" : "block"}`}>
          <div className="border-b border-[#0b3f45]/10 p-5">
            <h2 className="text-lg font-bold text-[#0b3f45]">Lugares para descobrir</h2>
            <p className="mt-1 text-xs text-[#0b3f45]/60">{filteredPlaces.length} resultados</p>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#0b3f45]/15 px-3">
              <Search size={17} className="text-[#0b3f45]/60" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou tipo de lugar" aria-label="Filtrar lugares" className="h-11 w-full min-w-0 bg-transparent text-sm text-[#0b3f45] outline-none" />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Limpar busca"><X size={16} /></button>}
            </label>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${category === item ? "bg-[#0b3f45] text-white" : "bg-[#edf2f0] text-[#0b3f45]"}`}>{item}</button>)}
            </div>
          </div>
          <div className="space-y-3 p-4 lg:max-h-[600px] lg:overflow-y-auto">
            {loading ? (
              <p role="status" className="p-6 text-center text-sm text-[#0b3f45]/60">Carregando lugares...</p>
            ) : error ? (
              <p role="alert" className="p-6 text-center text-sm text-red-700">{error}</p>
            ) : filteredPlaces.length === 0 ? (
              <div className="p-6 text-center">
                <Search className="mx-auto text-[#0b3f45]/40" size={28} />
                <p className="mt-3 font-bold text-[#0b3f45]">Nenhum lugar encontrado</p>
                <p className="mt-2 text-sm text-[#0b3f45]/60">Tente outra busca ou categoria.</p>
                <button type="button" onClick={() => { setSearch(""); setCategory("Todos"); }} className="mt-4 text-sm font-bold text-[#0b3f45] underline">Limpar filtros</button>
              </div>
            ) : filteredPlaces.map((place) => (
              <article key={place.id} className={`rounded-xl border p-4 transition ${activeSelectedId === place.id ? "border-[#0b3f45] bg-[#f1f7f5]" : "border-[#0b3f45]/10"}`}>
                <p className="text-xs font-semibold text-[#0b3f45]/60">{place.category}</p>
                <h3 className="mt-1 text-base font-bold text-[#0b3f45]">{place.name}</h3>
                {place.description && <p className="mt-2 text-sm text-[#0b3f45]/65">{place.description}</p>}
                {typeof place.distanceKm === "number" && Number.isFinite(place.distanceKm) && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#0b3f45]/70"><MapPin size={14} />{place.distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km de distância</p>}
                {place.address && <p className="mt-2 flex items-start gap-1 text-xs text-[#0b3f45]/65"><MapPin size={14} className="shrink-0" />{place.address}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => selectPlace(place)} className="rounded-lg bg-[#dfff00] px-4 py-2 text-xs font-bold text-[#0b3f45]">Selecionar no mapa</button>
                  <Link href={`/estabelecimentos/${encodeURIComponent(place.id)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3f45]">Detalhes <ArrowRight size={14} /></Link>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <section aria-label="Visualização do mapa" className={`relative min-h-[500px] overflow-hidden rounded-2xl border border-[#0b3f45]/10 bg-[#e5eeeb] lg:block lg:min-h-[720px] ${mobileView === "lista" ? "hidden" : "block"}`}>
          {mapContent ?? (
            <div className="flex h-full min-h-[500px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-3xl bg-white/80 p-5 shadow-sm"><Map size={42} className="text-[#0b3f45]" /></div>
              <h2 className="mt-5 text-xl font-bold text-[#0b3f45]">Mapa em preparação</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#0b3f45]/65">Aqui serão exibidos os lugares e suas localizações quando o Google Maps estiver conectado.</p>
            </div>
          )}
          {(activeLocationStatus === "denied" || activeLocationStatus === "unavailable") && (
            <div role="status" className="absolute left-4 right-4 top-4 rounded-xl bg-white p-4 text-sm text-[#0b3f45] shadow">
              {activeLocationStatus === "denied" ? "A localização não foi autorizada." : "Não foi possível obter sua localização."} Você ainda pode explorar os lugares pela lista ou pesquisar uma região no seletor de localização.
            </div>
          )}
          {selectedPlace && (
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white p-4 shadow-lg sm:left-6 sm:right-auto sm:w-80">
              <p className="text-xs font-semibold text-[#0b3f45]/60">Lugar selecionado</p>
              <h3 className="mt-1 font-bold text-[#0b3f45]">{selectedPlace.name}</h3>
              <p className="mt-1 text-xs text-[#0b3f45]/60">{selectedPlace.category}</p>
              <Link href={`/estabelecimentos/${encodeURIComponent(selectedPlace.id)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#0b3f45]">Ver detalhes <ArrowRight size={15} /></Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
