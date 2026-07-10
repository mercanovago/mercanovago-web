"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer";
import BrandLogo from "./BrandLogo";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

type NavigationItem = {
  label: string;
  href: string;
  sectionId: string;
};

const navigation: NavigationItem[] = [
  {
    label: "Inicio",
    href: "/",
    sectionId: "inicio",
  },
  {
    label: "Categorías",
    href: "/#categorias",
    sectionId: "categorias",
  },
  {
    label: "Catálogo",
    href: "/#catalogo",
    sectionId: "catalogo",
  },
  {
    label: "Ofertas",
    href: "/#ofertas",
    sectionId: "ofertas",
  },
  {
    label: "Nosotros",
    href: "/#nosotros",
    sectionId: "nosotros",
  },
  {
    label: "Contacto",
    href: "/#contacto-comercial",
    sectionId: "contacto-comercial",
  },
];

const sectionIds = [
  "categorias",
  "catalogo",
  "ofertas",
  "nosotros",
  "contacto-comercial",
];

export default function Navbar({
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] =
    useState("inicio");

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { totalItems, subtotal } = useCart();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);

      const scrollPosition = window.scrollY + 180;
      let currentSection = "inicio";

      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId);

        if (section && section.offsetTop <= scrollPosition) {
          currentSection = sectionId;
        }
      }

      setActiveSection(currentSection);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1536) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const catalogSection =
      document.getElementById("catalogo");

    if (catalogSection) {
      catalogSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMobileMenuOpen(false);
  }

  function handleMobileNavigation() {
    setMobileMenuOpen(false);
  }

  function handleSectionClick(sectionId: string) {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  }

  return (
    <>
      <header
        id="inicio"
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_14px_40px_rgba(15,23,42,0.12)]"
            : "shadow-none"
        }`}
      >
        <div className="hidden bg-green-700 text-white md:block">
          <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between gap-6 px-6 text-xs font-bold lg:px-8 2xl:px-10">
            <div className="flex min-w-0 items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 6h12v10H3z" />
                <path d="M15 9h3l3 3v4h-6z" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>

              <span className="truncate">
                Entrega coordinada en Riobamba y
                sectores cercanos
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-5">
              <span className="hidden items-center gap-2 lg:flex">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                Atención local personalizada
              </span>

              <span className="hidden h-4 w-px bg-white/30 lg:block" />

              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/593963488825?text=Hola%20Elizabeth%2C%20deseo%20recibir%20atenci%C3%B3n%20de%20MercaNova%20GO."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-green-200"
                >
                  Elizabeth
                </a>

                <span className="text-white/50">•</span>

                <a
                  href="https://wa.me/593983170593?text=Hola%20Andr%C3%A9s%2C%20deseo%20recibir%20atenci%C3%B3n%20de%20MercaNova%20GO."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-green-200"
                >
                  Andrés
                </a>
              </div>
            </div>
          </div>
        </div>

        <nav
          className={`border-b bg-white/95 backdrop-blur-xl transition-all duration-300 ${
            isScrolled
              ? "border-zinc-200/90"
              : "border-zinc-200/70"
          }`}
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 2xl:px-10">
            <div className="flex min-h-[76px] items-center gap-3 lg:min-h-[82px] lg:gap-4">
              <Link
                href="/"
                onClick={() =>
                  handleSectionClick("inicio")
                }
                className="shrink-0"
                aria-label="Ir al inicio de MercaNova GO"
              >
                <BrandLogo
                  size="sm"
                  showTagline={false}
                  compact
                  className="sm:hidden"
                />

                <BrandLogo
                  size="md"
                  showTagline={false}
                  compact
                  className="hidden sm:inline-flex xl:hidden"
                />

                <BrandLogo
                  size="md"
                  showTagline
                  compact
                  className="hidden xl:inline-flex"
                />
              </Link>

              <div className="hidden min-w-0 flex-1 items-center justify-center 2xl:flex">
                <div className="flex items-center gap-1">
                  {navigation.map((item) => {
                    const isActive =
                      activeSection === item.sectionId;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() =>
                          handleSectionClick(
                            item.sectionId
                          )
                        }
                        aria-current={
                          isActive ? "page" : undefined
                        }
                        className={`relative whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black transition ${
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "text-zinc-700 hover:bg-zinc-50 hover:text-green-600"
                        }`}
                      >
                        {item.label}

                        <span
                          className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-green-600 transition ${
                            isActive
                              ? "scale-x-100 opacity-100"
                              : "scale-x-0 opacity-0"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <form
                onSubmit={handleSearch}
                className="hidden min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100 lg:flex 2xl:max-w-[330px]"
              >
                <label
                  htmlFor="navbar-search"
                  className="sr-only"
                >
                  Buscar productos
                </label>

                <div className="flex min-w-0 flex-1 items-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-4 h-5 w-5 shrink-0 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    id="navbar-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="Busca frutas, verduras, lácteos..."
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-zinc-950 outline-none placeholder:font-medium placeholder:text-zinc-400"
                  />
                </div>

                <button
                  type="submit"
                  className="shrink-0 bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700 xl:px-5"
                >
                  Buscar
                </button>
              </form>

              <Link
                href="/chef"
                className="hidden shrink-0 items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-2.5 text-green-700 transition hover:border-green-600 hover:bg-green-600 hover:text-white 2xl:inline-flex"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M8 4a4 4 0 0 1 8 0" />
                    <path d="M5 8h14" />
                    <path d="M6 8v11h12V8" />
                    <path d="M9 12h6" />
                  </svg>
                </span>

                <span className="text-left leading-tight">
                  <span className="block whitespace-nowrap text-sm font-black">
                    Chef MercaNova GO
                  </span>

                  <span className="mt-0.5 block whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                    Asistente inteligente
                  </span>
                </span>
              </Link>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  aria-label={`Abrir canasta con ${totalItems} productos`}
                  className="group relative flex min-h-12 items-center gap-3 rounded-2xl bg-zinc-950 px-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl sm:px-4 xl:px-5"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle
                        cx="9"
                        cy="20"
                        r="1"
                      />
                      <circle
                        cx="19"
                        cy="20"
                        r="1"
                      />
                      <path d="M3 4h2l2.5 11h11l2-7H7" />
                    </svg>

                    {totalItems > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-black text-white ring-2 ring-zinc-950 group-hover:ring-green-600">
                        {totalItems > 99
                          ? "99+"
                          : totalItems}
                      </span>
                    )}
                  </span>

                  <span className="hidden text-left sm:block">
                    <span className="block text-[11px] font-bold text-zinc-300 group-hover:text-green-100 xl:text-xs">
                      Mi canasta
                    </span>

                    <span className="block text-sm font-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </span>
                </button>

                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(
                      (current) => !current
                    )
                  }
                  aria-label={
                    mobileMenuOpen
                      ? "Cerrar menú de navegación"
                      : "Abrir menú de navegación"
                  }
                  aria-expanded={mobileMenuOpen}
                  aria-controls="navbar-responsive-menu"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-900 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 2xl:hidden"
                >
                  {mobileMenuOpen ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12" />
                      <path d="M18 6 6 18" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16" />
                      <path d="M4 12h16" />
                      <path d="M4 17h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="mb-3 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100 lg:hidden"
            >
              <label
                htmlFor="mobile-navbar-search"
                className="sr-only"
              >
                Buscar productos
              </label>

              <div className="flex min-w-0 flex-1 items-center">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-4 h-5 w-5 shrink-0 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  id="mobile-navbar-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Buscar productos"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-semibold text-zinc-950 outline-none placeholder:text-zinc-400"
                />
              </div>

              <button
                type="submit"
                className="shrink-0 bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700"
              >
                Buscar
              </button>
            </form>

            <div
              ref={menuRef}
              id="navbar-responsive-menu"
              className={`grid overflow-hidden transition-all duration-300 2xl:hidden ${
                mobileMenuOpen
                  ? "grid-rows-[1fr] border-t border-zinc-200 opacity-100"
                  : "pointer-events-none grid-rows-[0fr] border-t border-transparent opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="py-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {navigation.map((item) => {
                      const isActive =
                        activeSection ===
                        item.sectionId;

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() =>
                            handleSectionClick(
                              item.sectionId
                            )
                          }
                          className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition ${
                            isActive
                              ? "bg-green-600 text-white"
                              : "bg-zinc-50 text-zinc-700 hover:bg-green-50 hover:text-green-700"
                          }`}
                        >
                          {item.label}

                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      );
                    })}

                    <Link
                      href="/chef"
                      onClick={handleMobileNavigation}
                      className="flex items-center justify-between rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M8 4a4 4 0 0 1 8 0" />
                            <path d="M5 8h14" />
                            <path d="M6 8v11h12V8" />
                            <path d="M9 12h6" />
                          </svg>
                        </span>

                        <span className="text-left">
                          <span className="block">
                            Chef MercaNova GO
                          </span>

                          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-green-100">
                            Asistente inteligente
                          </span>
                        </span>
                      </span>

                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <a
                      href="https://wa.me/593963488825?text=Hola%20Elizabeth%2C%20deseo%20recibir%20atenci%C3%B3n%20de%20MercaNova%20GO."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={
                        handleMobileNavigation
                      }
                      className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700 transition hover:border-green-600 hover:bg-green-600 hover:text-white"
                    >
                      Atención con Elizabeth

                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M7.3 19.15 3.75 20.25l1.15-3.45A8.5 8.5 0 1 1 7.3 19.15Z" />
                      </svg>
                    </a>

                    <a
                      href="https://wa.me/593983170593?text=Hola%20Andr%C3%A9s%2C%20deseo%20recibir%20atenci%C3%B3n%20de%20MercaNova%20GO."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={
                        handleMobileNavigation
                      }
                      className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700 transition hover:border-green-600 hover:bg-green-600 hover:text-white"
                    >
                      Atención con Andrés

                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M7.3 19.15 3.75 20.25l1.15-3.45A8.5 8.5 0 1 1 7.3 19.15Z" />
                      </svg>
                    </a>
                  </div>

                  {totalItems > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCartOpen(true);
                      }}
                      className="mt-3 flex w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-left text-white transition hover:bg-zinc-900"
                    >
                      <span>
                        <span className="block text-sm font-black">
                          {totalItems} producto(s) en
                          tu canasta
                        </span>

                        <span className="mt-1 block text-xs font-semibold text-zinc-300">
                          Revisa tu pedido antes de
                          finalizar
                        </span>
                      </span>

                      <span className="text-xl font-black text-green-400">
                        ${subtotal.toFixed(2)}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}