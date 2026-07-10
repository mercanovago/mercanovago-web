import type { Product } from "@/types/product";

const invalidImageValues = new Set([
  "",
  "null",
  "undefined",
  "none",
  "false",
  "/hero-market.jpg",
  "hero-market.jpg",
]);

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeText(value: string, maxLength: number): string {
  const cleanValue = value.trim().replace(/\s+/g, " ");

  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, maxLength - 1).trim()}…`;
}

function getCategoryPresentation(category: string): {
  primary: string;
  secondary: string;
  accent: string;
} {
  const normalizedCategory = category
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    normalizedCategory.includes("fruta") ||
    normalizedCategory.includes("frutas")
  ) {
    return {
      primary: "#14532d",
      secondary: "#22c55e",
      accent: "#facc15",
    };
  }

  if (
    normalizedCategory.includes("verdura") ||
    normalizedCategory.includes("hortaliza")
  ) {
    return {
      primary: "#052e16",
      secondary: "#16a34a",
      accent: "#86efac",
    };
  }

  if (
    normalizedCategory.includes("lacteo") ||
    normalizedCategory.includes("leche")
  ) {
    return {
      primary: "#0f766e",
      secondary: "#2dd4bf",
      accent: "#ccfbf1",
    };
  }

  if (
    normalizedCategory.includes("carne") ||
    normalizedCategory.includes("pollo") ||
    normalizedCategory.includes("proteina")
  ) {
    return {
      primary: "#7f1d1d",
      secondary: "#dc2626",
      accent: "#fecaca",
    };
  }

  if (
    normalizedCategory.includes("bebida") ||
    normalizedCategory.includes("jugo")
  ) {
    return {
      primary: "#164e63",
      secondary: "#0891b2",
      accent: "#a5f3fc",
    };
  }

  if (
    normalizedCategory.includes("abarrote") ||
    normalizedCategory.includes("despensa")
  ) {
    return {
      primary: "#78350f",
      secondary: "#d97706",
      accent: "#fde68a",
    };
  }

  if (
    normalizedCategory.includes("limpieza") ||
    normalizedCategory.includes("hogar")
  ) {
    return {
      primary: "#1e3a8a",
      secondary: "#2563eb",
      accent: "#bfdbfe",
    };
  }

  return {
    primary: "#052e16",
    secondary: "#16a34a",
    accent: "#bbf7d0",
  };
}

export function createProductFallbackImage(
  productName: string,
  category: string
): string {
  const safeProductName = escapeXml(
    normalizeText(productName || "Producto MercaNova", 34)
  );

  const safeCategory = escapeXml(
    normalizeText(category || "Selección MercaNova", 26).toUpperCase()
  );

  const colors = getCategoryPresentation(category);

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="900"
      viewBox="0 0 1200 900"
      role="img"
      aria-label="${safeProductName}"
    >
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors.primary}" />
          <stop offset="100%" stop-color="${colors.secondary}" />
        </linearGradient>

        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.40" />
          <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0" />
        </radialGradient>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="22"
            stdDeviation="24"
            flood-color="#000000"
            flood-opacity="0.22"
          />
        </filter>
      </defs>

      <rect width="1200" height="900" fill="url(#background)" />

      <circle cx="980" cy="120" r="300" fill="url(#glow)" />
      <circle cx="170" cy="820" r="340" fill="url(#glow)" />

      <path
        d="M930 90C807 129 733 220 724 348C829 346 923 301 982 214C1018 161 1027 115 1026 71C993 74 961 80 930 90Z"
        fill="${colors.accent}"
        fill-opacity="0.18"
      />

      <path
        d="M186 641C302 589 412 617 488 712C400 771 299 788 206 752C148 730 108 698 78 662C111 656 148 649 186 641Z"
        fill="${colors.accent}"
        fill-opacity="0.12"
      />

      <g filter="url(#shadow)">
        <rect
          x="120"
          y="120"
          width="960"
          height="660"
          rx="64"
          fill="#ffffff"
          fill-opacity="0.96"
        />
      </g>

      <g transform="translate(520 220)">
        <circle
          cx="80"
          cy="80"
          r="80"
          fill="${colors.secondary}"
          fill-opacity="0.12"
        />

        <path
          d="M80 42C56 42 38 60 38 84C38 115 68 139 80 148C92 139 122 115 122 84C122 60 104 42 80 42Z"
          fill="${colors.secondary}"
        />

        <path
          d="M80 61C91 45 108 36 127 35C124 55 112 69 93 76"
          fill="none"
          stroke="${colors.primary}"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          d="M80 78V124"
          stroke="#ffffff"
          stroke-width="8"
          stroke-linecap="round"
        />

        <path
          d="M58 101C69 94 91 94 102 101"
          fill="none"
          stroke="#ffffff"
          stroke-width="8"
          stroke-linecap="round"
        />
      </g>

      <text
        x="600"
        y="455"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="30"
        font-weight="800"
        letter-spacing="5"
        fill="${colors.secondary}"
      >
        ${safeCategory}
      </text>

      <text
        x="600"
        y="535"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="58"
        font-weight="900"
        fill="#18181b"
      >
        ${safeProductName}
      </text>

      <line
        x1="420"
        y1="590"
        x2="780"
        y2="590"
        stroke="#e4e4e7"
        stroke-width="3"
        stroke-linecap="round"
      />

      <text
        x="600"
        y="650"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        font-weight="700"
        fill="#52525b"
      >
        Selección MercaNova GO
      </text>

      <text
        x="600"
        y="700"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="22"
        font-weight="600"
        fill="#71717a"
      >
        Fotografía en actualización
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function isValidProductImage(image: string | null | undefined): boolean {
  if (typeof image !== "string") {
    return false;
  }

  const normalizedImage = image.trim();

  if (
    invalidImageValues.has(normalizedImage.toLowerCase()) ||
    normalizedImage.length === 0
  ) {
    return false;
  }

  return (
    normalizedImage.startsWith("/") ||
    normalizedImage.startsWith("https://") ||
    normalizedImage.startsWith("http://") ||
    normalizedImage.startsWith("data:image/")
  );
}

export function getProductImage(product: Product): string {
  if (isValidProductImage(product.image)) {
    return product.image.trim();
  }

  return createProductFallbackImage(
    product.name,
    product.category
  );
}