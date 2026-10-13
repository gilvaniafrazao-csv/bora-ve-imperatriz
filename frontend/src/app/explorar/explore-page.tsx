"use client";

import {
  ChevronDown,
  Heart,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  UserPlus,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const categories = [
  "Todos",
  "Restaurantes",
  "Bares",
  "Cafeterias",
  "Cultura",
  "Compras",
  "Vida Noturna",
  "Ao ar livre",
  "Esportes",
];

const eventCategories = [
  "Todos",
  "Shows",
  "Cultura",
  "Gastronomia",
  "Esportes",
  "Festas",
];

const places = [
  {
    id: 1,
    name: "Pizzaria Nostra",
    category: "Restaurantes",
    description: "Pizzas artesanais e ambiente aconchegante.",
    rating: 4.8,
    distance: "1,2 km",
    distanceKm: 1.2,
    price: "$$",
    open: true,
  },
  {
    id: 2,
    name: "Café da Praça",
    category: "Cafeterias",
    description: "Cafés especiais, doces e opções para o fim da tarde.",
    rating: 4.7,
    distance: "2,1 km",
    distanceKm: 2.1,
    price: "$$",
    open: true,
  },
  {
    id: 3,
    name: "Varanda 51",
    category: "Bares",
    description: "Drinks, música e gastronomia para aproveitar a noite.",
    rating: 4.6,
    distance: "3,4 km",
    distanceKm: 3.4,
    price: "$$$",
    open: false,
  },
  {
    id: 4,
    name: "Espaço Cultural",
    category: "Cultura",
    description: "Arte, cultura e programação para diferentes públicos.",
    rating: 4.5,
    distance: "4,3 km",
    distanceKm: 4.3,
    price: "$",
    open: true,
  },
];

const events = [
  {
    id: 1,
    name: "Festival de Música na Beira Rio",
    category: "Shows",
    description:
      "Uma noite com música ao vivo, artistas locais e muita diversão.",
    date: "10 OUT",
    time: "19:00",
    location: "Beira Rio",
    price: "Grátis",
    priceType: "gratis",
    period: "hoje",
  },
  {
    id: 2,
    name: "Feira Gastronômica de Imperatriz",
    category: "Gastronomia",
    description: "Sabores locais, restaurantes e experiências gastronômicas.",
    date: "12 OUT",
    time: "17:00",
    location: "Praça de Fátima",
    price: "Grátis",
    priceType: "gratis",
    period: "amanha",
  },
  {
    id: 3,
    name: "Noite Cultural",
    category: "Cultura",
    description:
      "Arte, música e apresentações culturais em uma noite especial.",
    date: "18 OUT",
    time: "18:30",
    location: "Espaço Cultural",
    price: "R$ 20",
    priceType: "pago",
    period: "fim-de-semana",
  },
  {
    id: 4,
    name: "Corrida Bora Imperatriz",
    category: "Esportes",
    description:
      "Evento esportivo para movimentar a cidade e reunir a comunidade.",
    date: "25 OUT",
    time: "06:00",
    location: "Beira Rio",
    price: "R$ 35",
    priceType: "pago",
    period: "fim-de-semana",
  },
];

export function ExplorePage() {
  const searchParams = useSearchParams();
  const contentType =
    searchParams.get("tipo") === "eventos" ? "eventos" : "lugares";
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [maxDistance, setMaxDistance] = useState(20);
  const [openNow, setOpenNow] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [eventPeriod, setEventPeriod] = useState("todos");
  const [eventPrice, setEventPrice] = useState("todos");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(search.trim());
  }

  const filteredPlaces = places.filter((place) => {
    const matchesCategory =
      selectedCategory === "Todos" || place.category === selectedCategory;

    const term = submittedSearch.toLowerCase();

    const matchesSearch =
      !term ||
      place.name.toLowerCase().includes(term) ||
      place.category.toLowerCase().includes(term) ||
      place.description.toLowerCase().includes(term);

    const matchesPrice = !selectedPrice || place.price === selectedPrice;

    const matchesDistance = place.distanceKm <= maxDistance;

    const matchesOpen = !openNow || place.open;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesDistance &&
      matchesOpen
    );
  });

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === "Todos" || event.category === selectedCategory;

    const term = submittedSearch.toLowerCase();

    const matchesSearch =
      !term ||
      event.name.toLowerCase().includes(term) ||
      event.category.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term);

    const matchesPeriod =
      eventPeriod === "todos" || event.period === eventPeriod;

    const matchesPrice =
      eventPrice === "todos" || event.priceType === eventPrice;

    return matchesCategory && matchesSearch && matchesPeriod && matchesPrice;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }

    if (sortBy === "distance") {
      return a.distanceKm - b.distanceKm;
    }

    return 0;
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8f5]">
      {/* Header */}
      <section className="bg-[#0b3f45] text-white">
        <header
          className="
      mx-auto
      flex
      min-h-[88px]
      md:min-h-[78px]
      w-full
      max-w-[1440px]
      items-center
      gap-3
      px-4
      md:gap-6
      md:px-6
      lg:px-14
    "
        >
          {/* LOGO */}
          <Link href="/home" className="shrink-0">
            <img
              src="/logo.svg"
              alt="Bora Vê"
              className="h-auto w-[105px] sm:w-[120px] lg:w-[145px]"
            />
          </Link>

          {/* LOCALIZAÇÃO */}
          <button
            type="button"
            className="
        hidden
        h-[38px]
        shrink-0
        items-center
        gap-2
        rounded-full
        bg-white/10
        px-4
        text-[12px]
        font-semibold
        text-white
        transition
        hover:bg-white/15
        md:flex
      "
          >
            <MapPin size={14} />

            <span>Imperatriz</span>

            <ChevronDown size={10} />
          </button>

          {/* BUSCA */}
          <form
            onSubmit={handleSearch}
            className="
        hidden
        h-[40px]
        min-w-0
        flex-1
        items-center
        rounded-full
        border
        border-white/10
        bg-white/10
        px-4
        md:flex
        lg:max-w-[550px]
      "
          >
            <Search size={15} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="O que você quer fazer hoje? Restaurantes, eventos..."
              className="
          min-w-0
          flex-1
          bg-transparent
          px-3
          text-[12px]
          text-white
          outline-none
          placeholder:text-white/55
        "
            />

            <button
              type="submit"
              className="
          shrink-0
          rounded-full
          bg-[#dfff00]
          px-4
          py-1.5
          text-[12px]
          font-bold
          uppercase
          text-[#0b3f45]
          transition
          hover:brightness-95
        "
            >
              Buscar
            </button>
          </form>

          {/* NAVEGAÇÃO */}
          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            <Link
              href="/explorar?tipo=lugares"
              className={`text-[12px] font-semibold transition ${
                contentType === "lugares"
                  ? "text-[#dfff00]"
                  : "text-white/85 hover:text-[#dfff00]"
              }`}
            >
              Lugares
            </Link>

            <Link
              href="/explorar?tipo=eventos"
              className={`text-[12px] font-semibold transition ${
                contentType === "eventos"
                  ? "text-[#dfff00]"
                  : "text-white/85 hover:text-[#dfff00]"
              }`}
            >
              Eventos
            </Link>

            <span className="h-5 w-px bg-white/20" />

            <Link
              href="/login"
              className="text-[12px] font-bold text-white transition hover:text-[#dfff00]"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro"
              className="
          flex
          h-[40px]
          items-center
          gap-2
          rounded-full
          bg-[#dfff00]
          px-5
          text-[12px]
          font-black
          text-[#0b3f45]
          shadow-[0_5px_18px_rgba(223,255,0,0.18)]
          transition
          hover:brightness-95
        "
            >
              <UserPlus size={14} />
              Criar Conta
            </Link>
          </nav>

          {/* MOBILE */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:hidden">
            <Link
              href="/login"
              className="shrink-0 text-[11px] font-bold text-white transition hover:text-[#dfff00]"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro"
              className="shrink-0 whitespace-nowrap rounded-full bg-[#dfff00] px-3 py-2 text-[10px] font-black text-[#0b3f45] transition hover:brightness-95"
            >
              Criar Conta
            </Link>
          </div>
        </header>

        {/* BUSCA MOBILE */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-5 pt-2 md:hidden">
          <form
            onSubmit={handleSearch}
            className="
      flex
      h-[42px]
      items-center
      rounded-full
      border
      border-white/10
      bg-white/10
      px-4
    "
          >
            <Search size={15} className="shrink-0 text-white/80" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="O que você quer fazer hoje?"
              className="
        min-w-0
        flex-1
        bg-transparent
        px-3
        text-[12px]
        text-white
        outline-none
        placeholder:text-white/55
      "
            />

            <button
              type="submit"
              className="
        shrink-0
        rounded-full
        bg-[#dfff00]
        px-3
        py-1.5
        text-[10px]
        font-black
        uppercase
        text-[#0b3f45]
      "
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <nav className="mx-auto flex w-full max-w-[1440px] bg-white px-4 pt-3 md:hidden">
        <Link
          href="/explorar?tipo=lugares"
          className={`flex-1 border-b-2 pb-3 text-center text-sm font-semibold transition ${
            contentType === "lugares"
              ? "border-[#0b3f45] text-[#0b3f45]"
              : "border-transparent text-[#0b3f45]/55"
          }`}
        >
          Lugares
        </Link>

        <Link
          href="/explorar?tipo=eventos"
          className={`flex-1 border-b-2 pb-3 text-center text-sm font-semibold transition ${
            contentType === "eventos"
              ? "border-[#0b3f45] text-[#0b3f45]"
              : "border-transparent text-[#0b3f45]/55"
          }`}
        >
          Eventos
        </Link>
      </nav>

      <section className="w-full min-w-0 overflow-hidden border-b border-teal/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-9">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-50">
              {contentType === "eventos"
                ? "Explore eventos"
                : "Explore lugares"}
            </p>

            <h1 className="mt-2 max-w text-[24px] font-bold leading-[1.1] tracking-tight text-teal sm:text-[26px] lg:text-[30px]">
              {contentType === "eventos"
                ? "O que está acontecendo na cidade?"
                : "O que combina com você hoje?"}
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              {contentType === "eventos"
                ? "Shows, cultura, festas e experiências para aproveitar a cidade."
                : "Restaurantes, cafés, cultura, lazer e muito mais por perto."}
            </p>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-teal">
              {submittedSearch
                ? `Resultados para "${submittedSearch}"`
                : selectedCategory !== "Todos"
                  ? selectedCategory
                  : "Recomendados para descobrir"}
            </h2>

            <p className="mt-1 text-sm text-teal-50">
              {contentType === "eventos"
                ? `${filteredEvents.length} ${
                    filteredEvents.length === 1 ? "evento" : "eventos"
                  }`
                : `${filteredPlaces.length} ${
                    filteredPlaces.length === 1 ? "lugar" : "lugares"
                  }`}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-xl border border-teal/15 bg-white px-4 py-2.5 text-sm font-semibold text-teal lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filtros
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-teal/15 bg-white px-4 py-2.5 text-sm font-semibold text-teal"
            >
              <Map size={17} />
              Mapa
            </button>

            <div className="relative hidden sm:block">
              {contentType === "lugares" && (
                <button
                  type="button"
                  onClick={() => setShowSortOptions((current) => !current)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-teal/15 bg-white px-4 py-2.5 text-sm font-semibold text-teal transition hover:border-teal/30 hover:bg-chip"
                >
                  {sortBy === "rating"
                    ? "Melhor avaliados"
                    : sortBy === "distance"
                      ? "Mais próximos"
                      : "Mais relevantes"}

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showSortOptions ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              {showSortOptions && (
                <div className="absolute right-0 top-full z-30 mt-2 min-w-[190px] overflow-hidden rounded-xl border border-teal/10 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("relevant");
                      setShowSortOptions(false);
                    }}
                    className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-teal transition hover:bg-chip"
                  >
                    Mais relevantes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("rating");
                      setShowSortOptions(false);
                    }}
                    className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-teal transition hover:bg-chip"
                  >
                    Melhor avaliados
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("distance");
                      setShowSortOptions(false);
                    }}
                    className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-teal transition hover:bg-chip"
                  >
                    Mais próximos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-2xl border border-teal/10 bg-white p-5 lg:block">
            <FilterContent
              contentType={contentType}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              openNow={openNow}
              setOpenNow={setOpenNow}
              eventPeriod={eventPeriod}
              setEventPeriod={setEventPeriod}
              eventPrice={eventPrice}
              setEventPrice={setEventPrice}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </aside>

          {/* Cards */}
          <div>
            {contentType === "eventos" ? (
              <>
                {filteredEvents.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                    {filteredEvents.map((event) => (
                      <article
                        key={event.id}
                        className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(12,70,81,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(12,70,81,0.12)]"
                      >
                        {/* Imagem */}
                        <div className="relative h-40 bg-teal-10 sm:h-44">
                          <div className="flex h-full items-center justify-center text-sm font-medium text-teal-50">
                            Foto do evento
                          </div>

                          <div className="absolute left-3 top-3 rounded-xl bg-[#dfff00] px-3 py-2 text-center text-teal shadow-sm">
                            <span className="block text-xs font-bold uppercase">
                              {event.date}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowLoginPrompt(true)}
                            aria-label={`Favoritar ${event.name}`}
                            className="absolute right-3 top-3 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white text-teal shadow-sm transition hover:scale-105"
                          >
                            <Heart size={18} />
                          </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4 sm:p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-teal-50">
                            {event.category}
                          </p>

                          <h3 className="mt-1 break-words text-lg font-bold leading-snug text-teal">
                            {event.name}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-teal-50">
                            {event.description}
                          </p>

                          <div className="mt-4 space-y-2 text-xs font-medium text-teal-50">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-teal">
                                Horário:
                              </span>
                              {event.time}
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              {event.location}
                            </div>

                            <div>
                              <span className="font-semibold text-teal">
                                Entrada:
                              </span>{" "}
                              {event.price}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="mt-5 w-full cursor-pointer rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-60"
                          >
                            Ver evento
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-teal/20 bg-white px-6 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-chip text-teal">
                      <Search size={21} />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-teal">
                      Nenhum evento encontrado
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-teal-50">
                      Tente pesquisar outro evento ou escolher uma categoria
                      diferente.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredPlaces.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                    {sortedPlaces.map((place) => (
                      <article
                        key={place.id}
                        className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(12,70,81,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(12,70,81,0.12)]"
                      >
                        <div className="relative h-40 bg-teal-10 sm:h-44">
                          <div className="flex h-full items-center justify-center text-sm font-medium text-teal-50">
                            Foto do local
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowLoginPrompt(true)}
                            aria-label={`Favoritar ${place.name}`}
                            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white text-teal shadow-sm transition hover:scale-105"
                          >
                            <Heart size={18} />
                          </button>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-teal-50">
                                {place.category}
                              </p>

                              <h3 className="mt-1 break-words text-lg font-bold leading-snug text-teal">
                                {place.name}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1 text-sm font-semibold text-ink">
                              <Star size={16} fill="currentColor" />
                              {place.rating}
                            </div>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-teal-50">
                            {place.description}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-teal-50">
                            <span>{place.price}</span>

                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {place.distance}
                            </span>

                            <span
                              className={
                                place.open ? "text-teal" : "text-danger"
                              }
                            >
                              {place.open ? "Aberto agora" : "Fechado"}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="mt-5 w-full rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-60"
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-teal/20 bg-white px-6 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-chip text-teal">
                      <Search size={21} />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-teal">
                      Nenhum lugar encontrado
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-teal-50">
                      Tente pesquisar outro termo ou escolher uma categoria
                      diferente.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSubmittedSearch("");
                        setSelectedCategory("Todos");
                      }}
                      className="mt-5 rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-teal"
                    >
                      Limpar busca
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Filtros mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 lg:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            className="absolute inset-0"
            onClick={() => setShowMobileFilters(false)}
          />

          <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-teal">Filtros</h2>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="text-sm font-semibold text-teal"
              >
                Fechar
              </button>
            </div>

            <FilterContent
              contentType={contentType}
              eventPeriod={eventPeriod}
              setEventPeriod={setEventPeriod}
              eventPrice={eventPrice}
              setEventPrice={setEventPrice}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              openNow={openNow}
              setOpenNow={setOpenNow}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="mt-7 w-full rounded-xl bg-lime px-5 py-3.5 font-bold text-teal"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setShowLoginPrompt(false)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-[#f8f5ed] p-7 text-center shadow-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#dfff00] text-[#0b3f45]">
              <Heart size={23} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#0b3f45]">
              Gostou desse lugar?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#527176]">
              Entre na sua conta para salvar lugares nos seus favoritos.
            </p>

            <Link
              href="/login"
              className="mt-6 block cursor-pointer rounded-xl bg-[#0b3f45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#14565d]"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro"
              className="mt-2 block cursor-pointer rounded-xl border border-teal/15 px-5 py-3 text-sm font-bold text-teal transition hover:bg-chip"
            >
              Criar conta
            </Link>

            <button
              type="button"
              onClick={() => setShowLoginPrompt(false)}
              className="mt-4 cursor-pointer text-sm font-semibold text-teal-50 transition hover:text-teal"
            >
              Continuar explorando
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

type FilterContentProps = {
  contentType: "lugares" | "eventos";

  selectedPrice: string;
  setSelectedPrice: (price: string) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  openNow: boolean;
  setOpenNow: (value: boolean) => void;

  eventPeriod: string;
  setEventPeriod: (period: string) => void;
  eventPrice: string;
  setEventPrice: (price: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

function FilterContent({
  contentType,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  maxDistance,
  setMaxDistance,
  openNow,
  setOpenNow,
  eventPeriod,
  setEventPeriod,
  eventPrice,
  setEventPrice,
}: FilterContentProps) {
  function clearFilters() {
    setSelectedCategory("Todos");

    if (contentType === "eventos") {
      setEventPeriod("todos");
      setEventPrice("todos");
      return;
    }

    setSelectedPrice("");
    setMaxDistance(20);
    setOpenNow(false);
  }

  return (
    <div className="w-full">
      {/* Título */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="shrink-0 text-teal" />
        <h3 className="font-bold text-teal">Filtros</h3>
      </div>

      {/* Categoria */}
      <div className="mt-5 border-t border-teal/10 pt-5">
        <p className="text-sm font-semibold text-teal">Categoria</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(contentType === "eventos" ? eventCategories : categories).map(
            (category) => {
              const selected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    selected
                      ? "bg-teal text-white"
                      : "bg-chip text-teal hover:bg-teal/10"
                  }`}
                >
                  {category}
                </button>
              );
            },
          )}
        </div>
      </div>
      {contentType === "eventos" ? (
        <>
          <div className="mt-6 border-t border-teal/10 pt-5">
            <p className="text-sm font-semibold text-teal">Quando?</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["todos", "Todos"],
                ["hoje", "Hoje"],
                ["amanha", "Amanhã"],
                ["fim-de-semana", "Fim de semana"],
              ].map(([value, label]) => {
                const selected = eventPeriod === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEventPeriod(value)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "bg-teal text-white"
                        : "bg-chip text-teal hover:bg-teal/15"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-teal/10 pt-5">
            <p className="text-sm font-semibold text-teal">Entrada</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["todos", "Todos"],
                ["gratis", "Grátis"],
                ["pago", "Pago"],
              ].map(([value, label]) => {
                const selected = eventPrice === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEventPrice(value)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "bg-teal text-white"
                        : "bg-chip text-teal hover:bg-teal/15"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 border-t border-teal/10 pt-5">
            <p className="text-sm font-semibold text-teal">Faixa de preço</p>

            <div className="mt-3 flex gap-2">
              {["$", "$$", "$$$"].map((price) => {
                const selected = selectedPrice === price;

                return (
                  <button
                    type="button"
                    key={price}
                    onClick={() => setSelectedPrice(selected ? "" : price)}
                    className={`flex-1 rounded-full border px-2 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border-teal bg-teal text-white"
                        : "border-teal/15 text-teal hover:border-teal"
                    }`}
                  >
                    {price}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-teal/10 pt-5">
            <p className="text-sm font-semibold text-teal">Distância</p>

            <input
              type="range"
              min="1"
              max="20"
              value={maxDistance}
              onChange={(event) => setMaxDistance(Number(event.target.value))}
              className="mt-4 w-full accent-teal"
            />

            <div className="mt-1 flex justify-between text-xs text-teal-50">
              <span>1 km</span>
              <span>Até {maxDistance} km</span>
            </div>
          </div>

          <div className="mt-6 border-t border-teal/10 pt-5">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-teal">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(event) => setOpenNow(event.target.checked)}
                className="size-4 accent-teal"
              />
              Aberto agora
            </label>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={clearFilters}
        className="mt-6 cursor-pointer rounded-lg px-2 py-1 text-sm font-semibold text-teal underline underline-offset-4 transition-all duration-200 hover:bg-chip hover:text-teal-60"
      >
        Limpar filtros
      </button>
    </div>
  );
}
