const controlShell =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition outline-none";

const dropdownArrow =
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22 stroke=%22%2378716c%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:14px_14px] bg-[position:right_0.9rem_center] bg-no-repeat pr-10";

export const textControlClass = `${controlShell} focus:border-primary/40 focus:ring-2 focus:ring-primary/15`;

export const selectControlClass = `${controlShell} ${dropdownArrow} appearance-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15`;
