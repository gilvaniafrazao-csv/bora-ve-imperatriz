"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe,
  MapPin,
  Phone,
  Search,
  Star,
  UserPlus,
  Wallet,
} from "lucide-react";

type Establishment = {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  price: string;
  open: boolean;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  photos: string[];
};

const establishments: Establishment[] = [
  {
    id: "1",
    name: "Pizzaria Nostra",
    category: "Restaurantes",
    description: "Pizzas artesanais e ambiente aconchegante.",
    rating: 4.8,
    price: "$$",
    open: true,
    photos: [],
  },
  {
    id: "2",
    name: "Café da Praça",
    category: "Cafeterias",
    description: "Cafés especiais, doces e opções para o fim da tarde.",
    rating: 4.7,
    price: "$$",
    open: true,
    photos: [],
  },
  {
    id: "3",
    name: "Varanda 51",
    category: "Bares",
    description: "Drinks, música e gastronomia para aproveitar a noite.",
    rating: 4.6,
    price: "$$$",
    open: false,
    photos: [],
  },
  {
    id: "4",
    name: "Espaço Cultural",
    category: "Cultura",
    description: "Arte, cultura e programação para diferentes públicos.",
    rating: 4.5,
    price: "$",
    open: true,
    photos: [],
  },
];

export default function EstablishmentDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const place = establishments.find((item) => item.id === id);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [headerSearch, setHeaderSearch] = useState("");

  if (!place) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-5 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#0b3f45]">
          Estabelecimento não encontrado
        </h1>
        <Link
          href="/explorar?tipo=lugares"
          className="mt-5 inline-block font-semibold text-[#0b3f45] underline"
        >
          Voltar para Explorar
        </Link>
      </main>
    );
  }

  const photos = place.photos;
  const hasPhotos = photos.length > 0;

  function previousPhoto() {
    setPhotoIndex((current) => (current - 1 + photos.length) % photos.length);
  }

  function nextPhoto() {
    setPhotoIndex((current) => (current + 1) % photos.length);
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      {/* Cabeçalho no padrão da página Explorar */}
      <section className="bg-[#0b3f45] text-white">
        <header className="mx-auto flex min-h-[88px] w-full max-w-[1440px] items-center gap-3 px-4 md:min-h-[78px] md:gap-6 md:px-6 lg:px-14">
          <Link href="/home" className="shrink-0">
            <img
              src="/logo.svg"
              alt="Bora Vê"
              className="h-auto w-[105px] sm:w-[120px] lg:w-[145px]"
            />
          </Link>

          <form
            action="/explorar"
            className="hidden h-10 min-w-0 flex-1 items-center rounded-full border border-white/10 bg-white/10 px-4 md:flex lg:max-w-[550px]"
          >
            <Search size={15} />
            <input
              name="busca"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              placeholder="O que você quer fazer hoje? Restaurantes, eventos..."
              className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/55"
            />
            <button
              type="submit"
              className="rounded-full bg-[#dfff00] px-4 py-1.5 text-xs font-bold text-[#0b3f45]"
            >
              Buscar
            </button>
          </form>

          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            <Link
              href="/home"
              className="text-xs font-semibold hover:text-[#dfff00]"
            >
              Início
            </Link>
            <Link
              href="/explorar?tipo=lugares"
              className="text-xs font-semibold text-[#dfff00]"
            >
              Lugares
            </Link>
            <Link
              href="/explorar?tipo=eventos"
              className="text-xs font-semibold hover:text-[#dfff00]"
            >
              Eventos
            </Link>
            <span className="h-5 w-px bg-white/20" />
            <Link
              href="/login"
              className="text-xs font-bold hover:text-[#dfff00]"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="flex h-10 items-center gap-2 rounded-full bg-[#dfff00] px-5 text-xs font-black text-[#0b3f45]"
            >
              <UserPlus size={14} />
              Criar Conta
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <Link href="/login" className="text-xs font-semibold">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-[#dfff00] px-3 py-2 text-xs font-bold text-[#0b3f45]"
            >
              Criar Conta
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 pb-4 md:hidden">
          <form
            action="/explorar"
            className="flex h-11 items-center gap-3 rounded-full bg-white/10 px-4"
          >
            <Search size={17} />
            <input
              name="busca"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              placeholder="O que você quer fazer hoje?"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            />
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
        <Link
          href="/explorar?tipo=lugares"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b3f45]"
        >
          <ArrowLeft size={17} />
          Voltar para Explorar
        </Link>

        {/* Título e indicadores */}
        <div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0b3f45]/55">
              Explore lugares
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b3f45] sm:text-4xl">
              {place.name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#0b3f45]/65">
              {place.category}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-[#0b3f45]/10 bg-white px-4 py-3">
              <Star size={17} className="text-amber-500" />
              <div>
                <p className="text-[10px] text-[#0b3f45]/55">
                  Avaliação demonstrativa
                </p>
                <p className="text-sm font-bold text-[#0b3f45]">
                  {place.rating}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#0b3f45]/10 bg-white px-4 py-3">
              <Wallet size={17} className="text-[#0b3f45]" />
              <div>
                <p className="text-[10px] text-[#0b3f45]/55">Faixa de preço</p>
                <p className="text-sm font-bold text-[#0b3f45]">
                  {place.price}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#0b3f45]/10 bg-white px-4 py-3">
              <Clock3 size={17} className="text-[#0b3f45]" />
              <div>
                <p className="text-[10px] text-[#0b3f45]/55">
                  Status demonstrativo
                </p>
                <p className="text-sm font-bold text-[#0b3f45]">
                  {place.open ? "Aberto" : "Fechado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carrossel */}
        <section
          aria-label="Fotos do estabelecimento"
          className="relative mt-7 overflow-hidden rounded-3xl bg-[#dceae6]"
        >
          <div className="relative flex h-[280px] items-center justify-center sm:h-[380px] lg:h-[450px]">
            {hasPhotos ? (
              <img
                src={photos[photoIndex]}
                alt={`Foto ${photoIndex + 1} de ${place.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="px-5 text-center">
                <p className="text-lg font-bold text-[#0b3f45]">
                  Galeria de fotos
                </p>
                <p className="mt-2 text-sm text-[#0b3f45]/60">
                  As fotos deste estabelecimento serão exibidas aqui.
                </p>
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousPhoto}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-[#0b3f45] shadow"
              >
                <ChevronLeft size={21} />
              </button>

              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Próxima foto"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-[#0b3f45] shadow"
              >
                <ChevronRight size={21} />
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPhotoIndex(index)}
                    aria-label={`Ir para foto ${index + 1}`}
                    aria-current={photoIndex === index ? "true" : undefined}
                    className={`h-2.5 rounded-full transition-all ${
                      photoIndex === index
                        ? "w-7 bg-[#dfff00]"
                        : "w-2.5 bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Informações */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#0b3f45]">Sobre o lugar</h2>
            <p className="mt-4 leading-8 text-[#0b3f45]/70">
              {place.description}
            </p>
          </section>

          <aside className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#0b3f45]">
              Localização e contato
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin size={19} className="mt-0.5 shrink-0 text-[#0b3f45]" />
                <div>
                  <p className="text-sm font-semibold text-[#0b3f45]">
                    Endereço
                  </p>
                  <p className="mt-1 text-sm text-[#0b3f45]/60">
                    {place.address ?? "Endereço ainda não cadastrado"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={19} className="mt-0.5 shrink-0 text-[#0b3f45]" />
                <div>
                  <p className="text-sm font-semibold text-[#0b3f45]">
                    Telefone / WhatsApp
                  </p>
                  <p className="mt-1 text-sm text-[#0b3f45]/60">
                    {place.phone ?? place.whatsapp ?? "Não informado"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe size={19} className="mt-0.5 shrink-0 text-[#0b3f45]" />
                <div>
                  <p className="text-sm font-semibold text-[#0b3f45]">Site</p>
                  {place.website ? (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-sm font-semibold text-[#0b3f45] underline"
                    >
                      Acessar site
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-[#0b3f45]/60">
                      Não informado
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`/mapa?estabelecimento=${place.id}`}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b3f45] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12616a]"
            >
              <MapPin size={17} />
              Ver no mapa
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
