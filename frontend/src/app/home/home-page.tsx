"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Beer,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  Martini,
  Music,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Trees,
  UserPlus,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

export function HomePage() {
  const [headerSearch, setHeaderSearch] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [region, setRegion] = useState("");
  const [locationName, setLocationName] = useState("Localização");
  const [isLocating, setIsLocating] = useState(false);

  function handleHeaderSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Busca do header:", headerSearch);
  }

  function handleHeroSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({
      search: heroSearch,
      region,
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f5ed] text-[#0b3f45]">
      {/* HEADER + HERO */}
      <section className="bg-[#0b3f45] text-white">
        {/* HEADER */}
        <header
          className="
            mx-auto
            flex
            min-h-[78px]
            w-full
            max-w-[1440px]
            items-center
            gap-6
            px-6
            lg:px-14
          "
        >
          {/* LOGO */}
          <Link href="/" className="shrink-0">
            <img
              src="/logo.svg"
              alt="Bora Vê"
              className="h-auto w-[130px] lg:w-[145px]"
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

          {/* BUSCA DO HEADER */}
          <form
            onSubmit={handleHeaderSearch}
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
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
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
              href="#lugares"
              className="text-[12px] font-semibold text-white/85 transition hover:text-[#dfff00]"
            >
              Lugares
            </Link>

            <Link
              href="#eventos"
              className="text-[12px] font-semibold text-white/85 transition hover:text-[#dfff00]"
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
          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <Link href="/login" className="text-[12px] font-bold text-white">
              Entrar
            </Link>

            <Link
              href="/cadastro"
              className="
                rounded-full
                bg-[#dfff00]
                px-4
                py-2.5
                text-[12px]
                font-black
                text-[#0b3f45]
              "
            >
              Criar Conta
            </Link>
          </div>
        </header>

        {/* HERO */}
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1440px]
            grid-cols-1
            items-center
            gap-12
            px-6
            pb-16
            pt-12
            lg:grid-cols-[1.05fr_0.95fr]
            lg:gap-20
            lg:px-14
            lg:pb-20
            lg:pt-20
          "
        >
          {/* CONTEÚDO ESQUERDO */}
          <div className="max-w-[650px]">
            <h1
              className="
                text-[46px]
                font-black
                leading-[1]
                tracking-[-2px]
                text-white
                sm:text-[54px]
                lg:text-[62px]
              "
            >
              Bora explorar os
              <br />
              melhores{" "}
              <span className="relative inline-block text-[#dfff00]">
                lugares
                <span
                  className="
                    absolute
                    -bottom-0
                    left-0
                    h-[3px]
                    w-full
                    rounded-full
                    bg-[#dfff00]
                  "
                />
              </span>
              <br />e{" "}
              <span className="relative inline-block text-[#35d6cc]">
                eventos
                <span
                  className="
                    absolute
                    -bottom-0
                    left-0
                    h-[3px]
                    w-full
                    rounded-full
                    bg-[#35d6cc]
                  "
                />
              </span>{" "}
              da
              <br />
              cidade?
            </h1>

            <p
              className="
                mt-7
                max-w-[570px]
                text-[16px]
                leading-[1.55]
                text-white/65
                sm:text-[15px]
              "
            >
              Descubra restaurantes incríveis, barzinhos animados, atrações ao
              ar livre, feiras e a agenda cultural completa.
            </p>

            {/* BUSCA PRINCIPAL */}
            <form
              onSubmit={handleHeroSearch}
              className="
                mt-8
                flex
                w-full
                max-w-[660px]
                flex-col
                gap-2
                rounded-[22px]
                bg-white
                p-2
                sm:flex-row
                sm:items-center
                sm:rounded-full
              "
            >
              {/* O QUE PROCURA */}
              <div className="min-w-0 flex-1 px-4 py-2 sm:py-0">
                <label
                  htmlFor="hero-search"
                  className="
                    block
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.4px]
                    text-[#607174]
                  "
                >
                  O que procura?
                </label>

                <input
                  id="hero-search"
                  type="text"
                  value={heroSearch}
                  onChange={(event) => setHeroSearch(event.target.value)}
                  placeholder="Restaurante, chopp, pizza..."
                  className="
                    mt-1
                    w-full
                    bg-transparent
                    text-[11px]
                    font-medium
                    text-[#173f44]
                    outline-none
                    placeholder:text-[#9aa5a5]
                  "
                />
              </div>

              {/* DIVISÓRIA */}
              <span className="hidden h-[38px] w-px bg-[#dfe4e1] sm:block" />

              {/* REGIÃO */}
              <div className="min-w-0 flex-1 px-4 py-2 sm:py-0">
                <label
                  htmlFor="hero-region"
                  className="
                    block
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.4px]
                    text-[#607174]
                  "
                >
                  Região / Bairro
                </label>

                <input
                  id="hero-region"
                  type="text"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="Perto de mim"
                  className="
                    mt-1
                    w-full
                    bg-transparent
                    text-[11px]
                    font-medium
                    text-[#173f44]
                    outline-none
                    placeholder:text-[#9aa5a5]
                  "
                />
              </div>

              {/* EXPLORAR */}
              <button
                type="submit"
                className="
                  flex
                  h-[48px]
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#dfff00]
                  px-8
                  text-[12px]
                  font-black
                  text-[#0b3f45]
                  transition
                  hover:brightness-95
                  active:scale-[0.98]
                "
              >
                <ArrowRight size={15} />
                Explorar
              </button>
            </form>

            {/* MAIS BUSCADOS */}
            <div
              className="
                mt-6
                flex
                flex-wrap
                items-center
                gap-2
                text-[12px]
                text-white/55
              "
            >
              <span className="mr-1">Mais buscados:</span>

              <button
                type="button"
                className=" inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/75 transition hover:bg-white/15"
              >
                <Martini size={12} />
                Happy Hour
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/75 transition hover:bg-white/15"
              >
                <Trees size={12}/>
                Lazer
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/75 transition hover:bg-white/15"
              >
                <Music size={12}/>
                Música ao Vivo
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/75 transition hover:bg-white/15"
              >
                <Utensils size={12}/>
                Hamburgueria
              </button>
            </div>
          </div>

          {/* DESTAQUE DA SEMANA */}
          <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
            {/* ETIQUETA PRINCIPAL */}
            <div
              className="
                absolute
                -left-5
                -top-5
                z-20
                flex
                rotate-[-2deg]
                items-center
                gap-2
                rounded-full
                bg-[#dfff00]
                px-5
                py-2
                text-[12px]
                font-black
                text-[#0b3f45]
                shadow-md
                sm:text-[13px]
              "
            >
              <Zap size={14} fill="currentColor" />
              BORA VÊ O QUE TÁ ROLANDO!
            </div>

            {/* ETIQUETA SECUNDÁRIA */}
            <div
              className="
                absolute
                left-8
                top-5
                z-20
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-[#173f44]
                px-4
                py-1.5
                text-[12px]
                font-semibold
                text-[#dfff00]
                shadow-md
              "
            > 
                <Sparkles size={14} className="shrink-0"/>
              <span>Destaque da Semana</span>
            </div>

            {/* CARD */}
            <article
              className="
                relative
                min-h-[390px]
                overflow-hidden
                rounded-[25px]
                bg-white
                shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                sm:min-h-[420px]
                lg:rotate-[1deg]
              "
            >
              {/* ÁREA DA IMAGEM */}
              <div className="h-[285px] w-full bg-[#f4f4f0]" />

              {/* INFORMAÇÕES */}
              <div className="absolute bottom-0 left-0 w-full bg-white px-6 py-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.5px]
                        text-[#0b3f45]
                      "
                    >
                      Gastronomia Regional
                    </span>

                    <h2
                      className="
                        mt-1
                        text-[18px]
                        font-black
                        text-[#173f44]
                      "
                    >
                      Sabor &amp; Pôr do Sol na Orla
                    </h2>

                    <div className="mt-1.5 flex items-center gap-1 text-[12px] text-[#7c8788]">
                      <MapPin size={10} fill="currentColor"/>
                      Beira-Rio, Imperatriz
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 shrink-0 text-[12px] font-black text-[#f59e0b]">
                    <Star size={14} fill="currentColor" strokeWidth="1.8"/>
                    <span>4.9</span> 
                    <span className="text-[12px] font-bold">(128)</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CATEGORIAS + LUGARES */}
      <section
        id="lugares"
        className="bg-[#f8f5ed] px-6 py-9 lg:px-14 lg:py-10"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {/* =====================================================
        CATEGORIAS DE DESCOBERTA
    ===================================================== */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-black text-[#0b3f45]">
                Categorias de Descoberta
              </h2>

              <button
                type="button"
                className="
            text-[12px]
            font-bold
            text-[#0b3f45]
            underline
            underline-offset-2
            transition
            hover:text-[#27b9b0]
          "
              >
                Ver todos
              </button>
            </div>

            {/* CARDS DAS CATEGORIAS */}
            <div
              className="
          mt-5
          grid
          grid-cols-2
          gap-4
          sm:grid-cols-3
          lg:grid-cols-6
        "
            >
              <CategoryCard
                icon= {Utensils}
                title="Restaurantes"
                subtitle="84 locais"
                iconBackground="#fff0c7"
              />

              <CategoryCard
                icon={Martini}
                title="Bares & Pubs"
                subtitle="42 locais"
                iconBackground="#caf5f6"
              />

              <CategoryCard
                icon={Trees}
                title="Lazer"
                subtitle="29 locais"
                iconBackground="#d7f7e9"
              />

              <CategoryCard
                icon={Music}
                title="Shows & Eventos"
                subtitle="18 esta semana"
                iconBackground="#eee0ff"
              />

              <CategoryCard
                icon={ShoppingBag}
                title="Compras & Feiras"
                subtitle="36 locais"
                iconBackground="#ffe0e5"
              />

              <CategoryCard
                icon={Sparkles}
                title="Experiências"
                subtitle="15 roteiros"
                iconBackground="#e8f6c9"
              />
            </div>
          </div>

          {/* =====================================================
        LUGARES BOMBANDO
    ===================================================== */}
          <div className="mt-15">
            {/* CABEÇALHO */}
            <div
              className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
            >
              <div>
                <span
                  className="
              text-[10px]
              font-black
              uppercase
              tracking-[1.3px]
              text-[#7b8989]
            "
                >
                  Mais populares na cidade
                </span>

                <h2
                  className="
              mt-1
              text-[26px]
              font-black
              leading-none
              tracking-[-1px]
              text-[#0b3f45]
              md:text-[30px]
            "
                >
                  Lugares Bombando em Imperatriz
                </h2>
              </div>

              {/* FILTROS */}
              <div
                className="
            flex
            w-fit
            max-w-full
            overflow-x-auto
            rounded-full
            bg-white
            p-1
            shadow-[0_1px_4px_rgba(20,50,55,0.05)]
          "
              >
                <button
                  type="button"
                  className="
              shrink-0
              rounded-full
              bg-[#0b3f45]
              px-5
              py-2
              text-[12px]
              font-bold
              text-[#dfff00]
            "
                >
                  Todos
                </button>

                <button
                  type="button"
                  className="
              shrink-0
              rounded-full
              px-5
              py-2
              text-[12px]
              font-semibold
              text-[#697879]
              transition
              hover:text-[#0b3f45]
            "
                >
                  Gastronomia
                </button>

                <button
                  type="button"
                  className="
              shrink-0
              rounded-full
              px-5
              py-2
              text-[12px]
              font-semibold
              text-[#697879]
              transition
              hover:text-[#0b3f45]
            "
                >
                  Vida Noturna
                </button>

                <button
                  type="button"
                  className="
              shrink-0
              rounded-full
              px-5
              py-2
              text-[12px]
              font-semibold
              text-[#697879]
              transition
              hover:text-[#0b3f45]
            "
                >
                  Ao Ar Livre
                </button>
              </div>
            </div>

            {/* CARDS */}
            <div
              className="
          mt-8
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          xl:grid-cols-4
        "
            >
              <PlaceCard
                badge="GOURMET"
                badgeClass="bg-[#315c62] text-white"
                rating="4.8"
                reviews="96"
                title="Varanda do Tocantins"
                location="Avenida Beira-Rio, Centro"
                description="Cozinha regional sofisticada com vista panorâmica do pôr do sol no Rio Tocantins."
                price="$$$ • Regional"
                status="Aberto agora"
              />

              <PlaceCard
                badge="COCKTAIL BAR"
                badgeClass="bg-[#3bd5cc] text-[#0b3f45]"
                rating="4.9"
                reviews="142"
                title="Bora Vê Bar & Lounge"
                location="Bairro Juçara"
                description="Drinks autorais com frutas tropicais da região, chopp trincando e música ao vivo."
                price="$$ • Pub & Drinks"
                status="Abre às 18h"
              />

              <PlaceCard
                badge="LAZER GRÁTIS"
                badgeClass="bg-[#dfff00] text-[#0b3f45]"
                rating="5.0"
                reviews="310"
                title="Orla Beira-Rio"
                location="Centro, Imperatriz"
                description="Espaço ao ar livre perfeito para caminhadas, água de coco e apreciar o pôr do sol."
                price="Gratuito"
                status="24h"
              />

              <PlaceCard
                badge="CULTURA & ARTE"
                badgeClass="bg-[#8b35e8] text-white"
                rating="4.7"
                reviews="54"
                title="Centro Cultural Ferreira Gullar"
                location="Praça de Fátima"
                description="Exposições de artistas locais, oficinas culturais e apresentações teatrais semanais."
                price="Grátis / Variado"
                status="Especial"
                special
              />
            </div>
          </div>
        </div>
      </section>
      {/* =========================================================
    EVENTOS & SHOWS
========================================================= */}
      <section
        id="eventos"
        className="bg-[#0b3f45] px-6 py-12 text-white lg:px-14 lg:py-14"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {/* CABEÇALHO */}
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span
                className="
            inline-flex
            rounded-full
            bg-[#dfff00]
            px-5
            py-1.5
            text-[10px]
            font-black
            uppercase
            tracking-[0.7px]
            text-[#0b3f45]
          "
              >
                Agenda da Semana
              </span>

              <h2
                className="
            mt-3
            text-[26px]
            font-black
            leading-none
            tracking-[-1px]
            text-white
            md:text-[32px]
          "
              >
                Eventos &amp; Shows em Imperatriz
              </h2>

              <p className="mt-2 text-[14px] text-white/55">
                Fique por dentro das festas, feiras, festivais e apresentações
                que vão rolar nos próximos dias.
              </p>
            </div>

            <button
              type="button"
              className="
          flex
          w-fit
          items-center
          gap-3
          rounded-full
          border
          border-white/10
          bg-white/10
          px-5
          py-3
          text-[12px]
          font-bold
          text-white
          transition
          hover:bg-white/15
        "
            >
              Ver agenda completa <ArrowRight size={14}/>
            </button>
          </div>

          {/* CARDS */}
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <EventCard
              day="08"
              category="FESTIVAL DE MPB"
              categoryClass="bg-[#1b5b5b] text-[#42d8cf]"
              dateClass="bg-[#dfff00] text-[#0b3f45]"
              title="Sons do Tocantins – Festival Aberto"
              schedule="Sábado às 19:00"
              location="Concha Acústica da Beira-Rio"
              price="Entrada Gratuita"
              priceClass="text-[#dfff00]"
            />

            <EventCard
              day="12"
              category="GASTRONOMIA"
              categoryClass="bg-[#31533d] text-[#dfff00]"
              dateClass="bg-[#39d5cb] text-[#0b3f45]"
              title="Feira Gastronômica & Cervejeira"
              schedule="Quinta a Domingo das 17h às 23h"
              location="Praça de Fátima"
              price="Acesso Livre"
              priceClass="text-white/70"
            />

            <EventCard
              day="15"
              category="STAND-UP COMEDY"
              categoryClass="bg-[#403750] text-[#d9a4ff]"
              dateClass="bg-[#bd6df2] text-[#0b3f45]"
              title="Noite do Riso com Artistas Regionais"
              schedule="Domingo às 20:00"
              location="Teatro Ferreira Gullar"
              price="Ingressos a partir de R$ 25"
              priceClass="text-[#dfff00]"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
    ROTEIROS
========================================================= */}
      <section
        id="roteiros"
        className="bg-[#f8f5ed] px-6 py-12 lg:px-14 lg:py-14"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {/* CABEÇALHO */}
          <div
            className="
        flex
        flex-col
        gap-3
        md:flex-row
        md:items-end
        md:justify-between
      "
          >
            <div>
              <span
                className="
            text-[10px]
            font-bold
            uppercase
            tracking-[1.2px]
            text-[#315c62]
          "
              >
                Guias Temáticos
              </span>

              <h2
                className="
            mt-1
            text-[26px]
            font-black
            leading-none
            tracking-[-1px]
            text-[#0b3f45]
            md:text-[30px]
          "
              >
                Roteiros para Curtir Imperatriz
              </h2>
            </div>

            <p className="text-[12px] text-[#879292]">
              Sugestões de passeios prontas para você aproveitar
            </p>
          </div>

          {/* CARDS */}
          <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <RouteCard
              icon={Sun}
              iconBackground="#fff0c7"
              label="ROTEIRO TARDE & NOITE"
              labelClass="text-[#27b9b0]"
              title="O Pôr do Sol Perfeito no Rio Tocantins"
              description="Um itinerário completo desde a caminhada na Beira-Rio, peixe frito com macaxeira até o chopp gelado ao anoitecer."
              infoLeft="4 paradas"
              infoRight="~3 horas"
            />

            <RouteCard
              icon={Utensils}
              iconBackground="#d7f7e9"
              label="GUIA GASTRONÔMICO"
              labelClass="text-[#169c7a]"
              title="Rota dos Sabores Regionais"
              description="Conheça os pratos icônicos da culinária maranhense e do cerrado em estabelecimentos tradicionais do Centro."
              infoLeft="5 locais"
              infoRight="$$ Variado"
            />

            <RouteCard
              icon={Beer}
              iconBackground="#eee0ff"
              label="SEXTOU NA CIDADE"
              labelClass="text-[#8b35e8]"
              title="Circuito do Chopp & Música ao Vivo"
              description="Os melhores bares e pubs para quem busca ambiente animado, porções generosas e som de qualidade no fim de semana."
              infoLeft="3 pubs"
              infoRight="A partir das 19h"
            />
          </div>
        </div>
      </section>
      {/* =========================================================
    CTA FINAL
========================================================= */}
      <section className="bg-[#e1f7f3] px-6 py-14 lg:px-14 lg:py-16">
        <div className="mx-auto w-full max-w-[1440px]">
          <div
            className="
        mx-auto
        flex
        w-full
        max-w-[1040px]
        flex-col
        gap-8
        rounded-[26px]
        border
        border-[#dfff00]/40
        bg-[#0b3f45]
        px-7
        py-9
        shadow-[0_18px_40px_rgba(11,63,69,0.18)]
        md:flex-row
        md:items-center
        md:justify-between
        md:px-12
        md:py-10
      "
          >
            {/* CONTEÚDO */}
            <div className="max-w-[570px]">
              <span
                className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            bg-[#dfff00]
            px-3
            py-1.5
            text-[10px]
            font-black
            uppercase
            tracking-[0.4px]
            text-[#0b3f45]
          "
              >
                ★ Sua experiência completa
              </span>

              <h2
                className="
            mt-5
            max-w-[500px]
            text-[26px]
            font-black
            leading-[1.05]
            tracking-[-1px]
            text-white
            md:text-[34px]
          "
              >
                Quer guardar seus
                <br />
                locais favoritos e
                <br />
                receber sugestões do
                <br />
                seu jeito?
              </h2>

              <p
                className="
            mt-4
            max-w-[540px]
            text-[14px]
            leading-[1.55]
            text-white/60
          "
              >
                Crie sua conta em menos de 1 minuto para salvar favoritos,
                personalizar seus interesses e não perder nada.
              </p>

              {/* BENEFÍCIOS */}
              <div
                className="
            mt-6
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-2
          "
              >
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#dfff00]">
                  <Check size={12} />
                  Salvar lugares &amp; eventos
                </span>

                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#dfff00]">
                  <Check size={12} />
                  Personalizar categorias
                </span>

                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#dfff00]">
                  <Check size={12} />
                  100% Gratuito
                </span>
              </div>
            </div>

            {/* BOTÃO */}
            <div className="shrink-0 md:pr-2">
              <Link
                href="/cadastro"
                className="
            flex
            h-[52px]
            items-center
            justify-center
            rounded-[16px]
            bg-[#dfff00]
            px-8
            text-[14px]
            font-black
            text-[#0b3f45]
            shadow-[0_7px_20px_rgba(223,255,0,0.22)]
            transition
            hover:-translate-y-0.5
            hover:brightness-95
            active:translate-y-0
          "
              >
                Criar Conta Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
    FOOTER
========================================================= */}
      <footer className="bg-[#062f33] px-6 pb-5 pt-12 text-white lg:px-14">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* CONTEÚDO PRINCIPAL */}
          <div
            className="
        grid
        grid-cols-1
        gap-10
        pb-12
        md:grid-cols-3
        md:gap-16
      "
          >
            {/* MARCA */}
            <div>
              <Link href="/" className="inline-flex">
                <img
                  src="/logo.svg"
                  alt="Bora Vê"
                  className="h-auto w-[145px]"
                />
              </Link>

              <p
                className="
            mt-3
            max-w-[280px]
            text-[12px]
            leading-[1.55]
            text-white/50
          "
              >
                Sua plataforma digital de descoberta de lugares, eventos e
                experiências urbanas.
              </p>
            </div>

            {/* NAVEGAÇÃO */}
            <div>
              <h3
                className="
            text-[14px]
            font-black
            uppercase
            tracking-[0.7px]
            text-[#dfff00]
          "
              >
                Navegação
              </h3>

              <nav className="mt-4 flex flex-col items-start gap-2.5">
                <Link
                  href="#lugares"
                  className="text-[12px] text-white/55 transition hover:text-white"
                >
                  Lugares &amp; Restaurantes
                </Link>

                <Link
                  href="#eventos"
                  className="text-[12px] text-white/55 transition hover:text-white"
                >
                  Agenda de Eventos
                </Link>

                <Link
                  href="#roteiros"
                  className="text-[12px] text-white/55 transition hover:text-white"
                >
                  Roteiros Locais
                </Link>

                <Link
                  href="#sobre"
                  className="text-[12px] text-white/55 transition hover:text-white"
                >
                  Sobre o Bora Vê
                </Link>
              </nav>
            </div>

            {/* ESTABELECIMENTOS */}
            <div>
              <h3
                className="
            text-[14px]
            font-black
            uppercase
            tracking-[0.7px]
            text-[#dfff00]
          "
              >
                Para estabelecimentos
              </h3>

              <p
                className="
            mt-4
            max-w-[360px]
            text-[12px]
            leading-[1.5]
            text-white/50
          "
              >
                Quer cadastrar seu restaurante ou evento no Bora Vê?
              </p>

              <button
                type="button"
                className="
            mt-4
            flex
            h-[38px]
            w-full
            max-w-[400px]
            items-center
            justify-between
            rounded-[12px]
            border
            border-white/15
            bg-white/10
            px-4
            text-[12px]
            font-bold
            text-white
            transition
            hover:bg-white/15
          "
              >
                <span>Cadastrar meu local</span>
                <span className="text-[16px]">→</span>
              </button>
            </div>
          </div>

          {/* LINHA INFERIOR */}
          <div
            className="
        flex
        min-h-[48px]
        items-center
        justify-center
        border-t
        border-white/10
        pt-4
        text-center
      "
          >
            <p className="text-[12px] text-white/30">
              © 2026 Bora Vê. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

type CategoryCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconBackground: string;
};

function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  iconBackground,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className="
        group
        flex
        min-h-[120px]
        flex-col
        items-center
        justify-center
        rounded-[18px]
        border
        border-[#e4e7e3]
        bg-white
        px-3
        py-4
        text-center
        shadow-[0_2px_6px_rgba(20,50,55,0.04)]
        transition
        duration-200
        hover:-translate-y-1
        hover:border-[#27b9b0]/30
        hover:shadow-[0_8px_20px_rgba(20,50,55,0.08)]
      "
    >
      <span
        className="
          flex
          h-[45px]
          w-[45px]
          items-center
          justify-center
          rounded-full
          text-[19px]
          transition
          group-hover:scale-105
        "
        style={{ backgroundColor: iconBackground }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <span
        className="
          mt-3
          text-[14px]
          font-black
          leading-tight
          text-[#173f44]
        "
      >
        {title}
      </span>

      <span className="mt-1 text-[12px] text-[#8b9696]">{subtitle}</span>
    </button>
  );
}

type PlaceCardProps = {
  badge: string;
  badgeClass: string;
  rating: string;
  reviews: string;
  title: string;
  location: string;
  description: string;
  price: string;
  status: string;
  special?: boolean;
};

function PlaceCard({
  badge,
  badgeClass,
  rating,
  reviews,
  title,
  location,
  description,
  price,
  status,
  special = false,
}: PlaceCardProps) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[24px]
        border
        border-[#e3e7e4]
        bg-white
        shadow-[0_8px_22px_rgba(20,50,55,0.07)]
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-[0_14px_30px_rgba(20,50,55,0.11)]
      "
    >
      {/* IMAGEM */}
      <div className="relative h-[190px] bg-[#f0f1f2]">
        {/* BADGE */}
        <span
          className={`
            absolute
            left-3
            top-3
            rounded-full
            px-3
            py-1.5
            text-[10px]
            font-black
            ${badgeClass}
          `}
        >
          {badge}
        </span>

        {/* FAVORITO */}
        <button
          type="button"
          aria-label={`Favoritar ${title}`}
          className="
            absolute
            right-3
            top-3
            flex
            h-[34px]
            w-[34px]
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#93a0a0]
            shadow-[0_3px_10px_rgba(20,50,55,0.12)]
            transition
            hover:text-[#27b9b0]
          "
        >
          <Heart size={16} />
        </button>

        {/* NOTA */}
        <div
          className="
            absolute
            bottom-3
            left-3
            flex
            items-center
            gap-1
            rounded-full
            bg-white
            px-2.5
            py-1
            text-[12px]
            shadow-sm
          "
        >
          <Star size={12} fill="currentColor" className="text-[#f5a000]"/>

          <span className="font-black text-[#f5a000]">{rating}</span>

          <span className="text-[#a0aaaa]">({reviews})</span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex min-h-[205px] flex-col px-5 py-5">
        <h3
          className="
            text-[16px]
            font-black
            leading-[1.15]
            text-[#173f44]
          "
        >
          {title}
        </h3>

        <div
          className="
            mt-2
            flex
            items-center
            gap-1
            text-[10px]
            text-[#859191]
          "
        >
          <MapPin size={10} />

          <span>{location}</span>
        </div>

        <p
          className="
            mt-3
            text-[12px]
            leading-[1.45]
            text-[#6e7b7c]
          "
        >
          {description}
        </p>

        {/* RODAPÉ DO CARD */}
        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-[#eef0ed]
            pt-4
          "
        >
          <span
            className={`
              text-[12px]
              font-semibold
              ${price === "Gratuito" ? "text-[#19a77c]" : "text-[#173f44]"}
            `}
          >
            {price}
          </span>

          <span
            className={`
              flex
              items-center
              gap-1
              text-[10px]
              font-semibold
              ${special ? "text-[#f59e0b]" : "text-[#19a77c]"}
            `}
          >
            {!special && (
              <span className="h-[6px] w-[6px] rounded-full bg-current" />
            )}

            {status}
          </span>
        </div>
      </div>
    </article>
  );
}
type EventCardProps = {
  day: string;
  category: string;
  categoryClass: string;
  dateClass: string;
  title: string;
  schedule: string;
  location: string;
  price: string;
  priceClass: string;
};

function EventCard({
  day,
  category,
  categoryClass,
  dateClass,
  title,
  schedule,
  location,
  price,
  priceClass,
}: EventCardProps) {
  return (
    <article
      className="
        flex
        min-h-[240px]
        flex-col
        rounded-[25px]
        border
        border-white/10
        bg-[#062f33]
        px-6
        py-6
        transition
        duration-200
        hover:-translate-y-1
        hover:bg-[#07383d]
      "
    >
      {/* TOPO */}
      <div className="flex items-start justify-between gap-4">
        {/* DATA */}
        <div
          className={`
            flex
            h-[56px]
            w-[56px]
            shrink-0
            flex-col
            items-center
            justify-center
            rounded-[18px]
            font-black
            ${dateClass}
          `}
        >
          <span className="text-[10px] leading-none">OUT</span>

          <span className="mt-1 text-[22px] leading-none">{day}</span>
        </div>

        {/* CATEGORIA */}
        <span
          className={`
            rounded-full
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            ${categoryClass}
          `}
        >
          {category}
        </span>
      </div>

      {/* CONTEÚDO */}
      <h3
        className="
          mt-5
          text-[16px]
          font-black
          leading-[1.2]
          text-white
        "
      >
        {title}
      </h3>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-[12px] text-white/65">
          <Clock size={12} className="shrink-0 text-[#dfff00]"/>
          <span>{schedule}</span>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <MapPin size={12} className="shrink-0 text-[#35d6cc]" />
          <span>{location}</span>
        </div>
      </div>

      {/* RODAPÉ */}
      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-white/10
          pt-4
        "
      >
        <span className={`text-[12px] font-semibold ${priceClass}`}>
          {price}
        </span>

        <button
          type="button"
          className="
            inline-flex
            items-center
            gap-1.5
            text-[12px]
            font-semibold
            text-white
            transition
            hover:text-[#dfff00]
          "
        >
          Saiba Mais <ArrowRight size={12} className="shrink-0"/>
        </button>
      </div>
    </article>
  );
}
type RouteCardProps = {
  icon: LucideIcon;
  iconBackground: string;
  label: string;
  labelClass: string;
  title: string;
  description: string;
  infoLeft: string;
  infoRight: string;
};

function RouteCard({
  icon: Icon,
  iconBackground,
  label,
  labelClass,
  title,
  description,
  infoLeft,
  infoRight,
}: RouteCardProps) {
  return (
    <article
      className="
        flex
        min-h-[265px]
        flex-col
        rounded-[24px]
        border
        border-[#e3e7e4]
        bg-white
        px-6
        py-6
        shadow-[0_8px_22px_rgba(20,50,55,0.07)]
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-[0_14px_30px_rgba(20,50,55,0.11)]
      "
    >
      {/* ÍCONE */}
      <div
        className="
          flex
          h-[48px]
          w-[48px]
          items-center
          justify-center
          rounded-[15px]
          text-[20px]
        "
        style={{ backgroundColor: iconBackground }}
      >
        <Icon size={21} strokeWidth={1.8} className="text-[#0b3f45]"/>
      </div>

      {/* LABEL */}
      <span
        className={`
          mt-5
          text-[10px]
          font-bold
          uppercase
          tracking-[0.5px]
          ${labelClass}
        `}
      >
        {label}
      </span>

      {/* TÍTULO */}
      <h3
        className="
          mt-2
          text-[16px]
          font-black
          leading-[1.25]
          text-[#173f44]
        "
      >
        {title}
      </h3>

      {/* DESCRIÇÃO */}
      <p
        className="
          mt-3
          text-[12px]
          leading-[1.45]
          text-[#6f7d7e]
        "
      >
        {description}
      </p>

      {/* INFORMAÇÕES */}
      <div
        className="
          mt-auto
          flex
          flex-wrap
          items-center
          gap-4
          pt-5
          text-[12px]
          font-bold
          text-[#607172]
        "
      >
        <span className="flex items-center gap-1.5">
          <MapPin size={12} />
          {infoLeft}
        </span>

        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {infoRight}
        </span>
      </div>
    </article>
  );
}