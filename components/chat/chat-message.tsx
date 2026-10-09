"use client";

import type { PetsUIMessage } from "@/lib/chat/agent";
import { Markdown } from "./markdown";
import { usePetName } from "./pet-names";
import {
  ActivityLine,
  activityPhrase,
  Citations,
  collectCitations,
  isMutationTool,
  isRunning,
  MutationLine,
  NavigatedLine,
  readToolPart,
} from "./tool-lines";

export function ChatMessage({
  message,
  messages,
  streaming,
  stopped,
}: {
  message: PetsUIMessage;
  messages: PetsUIMessage[];
  streaming: boolean;
  stopped?: boolean;
}) {
  const petName = usePetName(messages);

  if (message.role === "user") {
    const text = message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");
    if (!text) return null;
    const first = messages[0]?.id === message.id;
    return (
      <div className={first ? "" : "mt-2 border-t border-rule pt-6"}>
        <p className="mb-1 text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase">
          You asked
        </p>
        <p className="text-[15px] leading-6 font-semibold break-words whitespace-pre-wrap text-ink">
          {text}
        </p>
      </div>
    );
  }

  if (message.role !== "assistant") return null;

  const toolParts = message.parts.flatMap((part) => {
    const tool = readToolPart(part);
    return tool ? [tool] : [];
  });
  const lastRunning = toolParts.findLast(
    (tool) => isRunning(tool) && !isMutationTool(tool.name),
  );
  const lastPart = message.parts.at(-1);
  const lastTool = lastPart ? readToolPart(lastPart) : null;
  const confirming =
    lastTool !== null &&
    isMutationTool(lastTool.name) &&
    (lastTool.state === "approval-requested" ||
      lastTool.state === "approval-responded");
  const showActivity = streaming && lastPart?.type !== "text" && !confirming;
  const hasText = message.parts.some(
    (part) => part.type === "text" && part.text.trim().length > 0,
  );

  return (
    <div className="space-y-3 text-[15px] leading-6 break-words text-ink">
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return part.text ? <Markdown key={index} text={part.text} /> : null;
        }
        const tool = readToolPart(part);
        if (!tool) return null;
        if (tool.name === "navigate" && tool.state === "output-available") {
          return <NavigatedLine key={index} part={tool} petName={petName} />;
        }
        if (isMutationTool(tool.name)) {
          const superseded =
            tool.state === "output-error" &&
            message.parts
              .slice(index + 1)
              .some((later) => readToolPart(later)?.name === tool.name);
          if (superseded) return null;
          return (
            <MutationLine
              key={index}
              part={tool}
              tool={tool.name}
              message={message}
              petName={petName}
            />
          );
        }
        return null;
      })}
      {showActivity && (
        <ActivityLine phrase={activityPhrase(lastRunning, petName)} />
      )}
      {hasText && <Citations records={collectCitations(message)} />}
      {stopped && <p className="text-[13px] text-ink-muted">Stopped.</p>}
    </div>
  );
}
