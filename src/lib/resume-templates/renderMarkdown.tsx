// Utilitário para renderizar markdown simples no preview do currículo
// Suporta: **negrito**, *itálico*, bullets explícitos (- ou * ou •), e quebras de linha
// Linhas em branco criam espaçamento, mas NÃO viram bullet points

import React from "react";

/**
 * Renderiza markdown simples para JSX.
 * Regra chave: só vira bullet se a linha COMEÇAR com `- `, `* ` ou `• `
 * Linhas normais (incluindo linhas em branco inseridas pelo usuário) ficam como parágrafo inline.
 */
export function renderMarkdownToJSX(
  content: string,
  textClassName?: string,
): React.ReactNode {
  if (!content) return null;

  // Divide o conteúdo em tokens: bullets consecutivos e blocos de texto
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let keyCounter = 0;

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    result.push(
      <ul key={`ul-${keyCounter++}`} className="ml-4 list-disc space-y-0.5">
        {bulletBuffer.map((b, i) => (
          <li key={i} className={textClassName}>
            {parseInline(b)}
          </li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  for (const line of lines) {
    // Linha de bullet explícita: começa com - , * ou •
    if (/^[-•]\s+/.test(line) || /^\*\s+/.test(line)) {
      const text = line.replace(/^[-•*]\s+/, "");
      bulletBuffer.push(text);
    } else if (line.trim() === "") {
      // Linha em branco: fecha bullets pendentes e adiciona espaçamento leve
      flushBullets();
      result.push(
        <div key={`br-${keyCounter++}`} className="h-1" />,
      );
    } else {
      // Linha de texto normal
      flushBullets();
      result.push(
        <p key={`p-${keyCounter++}`} className={textClassName}>
          {parseInline(line)}
        </p>,
      );
    }
  }

  flushBullets();

  return <>{result}</>;
}

/**
 * Renderiza markdown simples para HTML string (para dangerouslySetInnerHTML).
 * Mantém compatibilidade com o DefaultTemplate existente.
 */
export function renderMarkdownToHTML(content: string): string {
  if (!content) return "";

  const lines = content.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const isBullet = /^[-•*]\s+/.test(line);

    if (isBullet) {
      if (!inList) {
        // padding-left garante que o marcador disc fique dentro do container
        html += "<ul style='padding-left:1.25rem;list-style:disc;'>";
        inList = true;
      }
      const text = parseInlineToHTML(line.replace(/^[-•*]\s+/, ""));
      html += `<li>${text}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (line.trim() === "") {
        html += "<div style='height:0.25rem'></div>";
      } else {
        html += `<p>${parseInlineToHTML(line)}</p>`;
      }
    }
  }

  if (inList) html += "</ul>";

  return html;
}

// Analisa inline markdown: **bold**, *italic*
function parseInline(text: string): React.ReactNode {
  // Regex para capturar **bold** e *italic* intercalados com texto normal
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    } else if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Analisa inline markdown para HTML
function parseInlineToHTML(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}
