"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  className?: string;
  title?: string;
};

function copyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ShareButton({ className = "", title }: Props) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share(title ? { title, url } : { url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        copyText(url);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      copyText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button type="button" onClick={handleShare} className={className}>
      {copied ? t("copied") : t("share")}
    </button>
  );
}
