"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { personas, getPersonaIdByAgentName } from "@/lib/personas";
import type { Persona } from "@/lib/personas";
import { VisualizationsPanel } from "@/components/visualizations";
import actionsData from "@/data/actions.json";

// ---------------------------------------------------------------------------
// Simple markdown to HTML (no library needed)
// ---------------------------------------------------------------------------
function markdownToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-xl font-semibold mt-8 mb-3 pb-2 border-b">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
    )
    // Blockquotes
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-4 pl-4 my-2 text-sm italic" style="border-color: #545DFF; color: #6b7280;">$1</blockquote>'
    )
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Numbered list items with indented blockquotes
    .replace(
      /^\d+\.\s+(.+)$/gm,
      '<li class="ml-4 list-decimal mb-1">$1</li>'
    )
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc mb-1">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-6" style="border-color: rgba(0,5,49,0.1);" />')
    // Paragraphs (blank lines)
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    // Line breaks
    .replace(/\n/g, "<br />");

  return `<div class="leading-relaxed text-sm"><p class="mb-3">${html}</p></div>`;
}

// ---------------------------------------------------------------------------
// Actions data types and loading
// ---------------------------------------------------------------------------
interface ActionItem {
  action_type: string;
  agent_id: number;
  agent_name: string;
  platform: string;
  round_num: number;
  timestamp: string;
  action_args: {
    content?: string;
    post_id?: number;
    comment_id?: number;
    quote_content?: string;
    original_content?: string;
    original_author_name?: string;
  };
}

const allActions: ActionItem[] = (
  actionsData as { data: { actions: ActionItem[] } }
).data.actions;

// Filter to only posts and comments, sort by round (ascending)
const feedActions = allActions
  .filter(
    (a) =>
      a.action_type === "CREATE_POST" || a.action_type === "CREATE_COMMENT" || a.action_type === "QUOTE_POST"
  )
  .sort((a, b) => a.round_num - b.round_num);

// ---------------------------------------------------------------------------
// Report Tab
// ---------------------------------------------------------------------------
function ReportTab({ reportMd }: { reportMd: string }) {
  const html = useMemo(() => markdownToHtml(reportMd), [reportMd]);
  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Feed Tab
// ---------------------------------------------------------------------------
function FeedItem({ action }: { action: ActionItem }) {
  const personaId = getPersonaIdByAgentName(action.agent_name);
  const persona =
    personaId !== undefined
      ? personas.find((p) => p.id === personaId)
      : undefined;
  const color = persona?.color || "#6b7280";
  const displayName = persona?.name || action.agent_name;
  const content = action.action_args.content || "";
  const isComment = action.action_type === "CREATE_COMMENT";

  return (
    <Card className={isComment ? "ml-8" : ""} size="sm" style={{ borderRadius: 12 }}>
      <CardContent>
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: color }}
          >
            {displayName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm">{displayName}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {action.platform === "twitter" ? "Twitter" : "Reddit"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Round {action.round_num}
              </span>
              {isComment && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  Comment
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedTab() {
  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <div className="max-w-3xl mx-auto py-4 px-4 space-y-3">
        {feedActions.map((action, i) => (
          <FeedItem key={`${action.timestamp}-${i}`} action={action} />
        ))}
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Chat Tab
// ---------------------------------------------------------------------------
function ChatTab() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="w-72 border-r overflow-y-auto flex-shrink-0">
        <div className="p-3">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-3">
            Panelists
          </h3>
          <div className="space-y-1">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`w-full text-left px-3 py-2.5 transition-colors ${
                  selectedPersona?.id === persona.id
                    ? "bg-accent/10 border-l-2"
                    : "hover:bg-muted"
                }`}
                style={{
                  borderRadius: 8,
                  borderLeftColor: selectedPersona?.id === persona.id ? "#545DFF" : "transparent",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: persona.color }}
                  >
                    {persona.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {persona.name}
                    </div>
                    <Badge
                      variant={
                        persona.role === "partner" ? "default" : "secondary"
                      }
                      className="text-[10px] px-1 py-0 mt-0.5"
                    >
                      {persona.role === "partner" ? "Partner" : "Consumer"}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedPersona ? (
          <ChatPanel persona={selectedPersona} key={selectedPersona.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center px-4">
              <p className="text-lg font-medium mb-1">
                Select a panelist to chat with
              </p>
              <p className="text-sm">
                Ask follow-up questions about their reactions to The Golden Door,
                10/10, or The Rescue
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPanel({ persona }: { persona: Persona }) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { personaId: persona.id },
      }),
    [persona.id]
  );

  const chat = useChat({
    id: `chat-${persona.id}`,
    transport,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inputValue.trim() ||
      chat.status === "streaming" ||
      chat.status === "submitted"
    )
      return;
    chat.sendMessage({ text: inputValue.trim() });
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Persona Header */}
      <div className="border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: persona.color }}
          >
            {persona.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold">{persona.name}</div>
            <div className="text-xs text-muted-foreground">
              {persona.profession} | {persona.mbti} | Age {persona.age}
            </div>
          </div>
          <Badge
            variant={persona.role === "partner" ? "default" : "secondary"}
            className="ml-auto flex-shrink-0"
          >
            {persona.role === "partner" ? "Partner" : "Consumer"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {persona.bio}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chat.messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>
              Start a conversation with {persona.name}. Ask about their
              reactions to The Golden Door, 10/10, or The Rescue.
            </p>
          </div>
        )}
        {chat.messages.map((msg) => {
          const isUser = msg.role === "user";
          // Extract text content from message parts
          const textContent =
            msg.parts
              ?.filter(
                (p): p is { type: "text"; text: string } => p.type === "text"
              )
              .map((p) => p.text)
              .join("") || "";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser ? "text-white" : "bg-muted"
                }`}
                style={{
                  borderRadius: 12,
                  backgroundColor: isUser ? "#000531" : undefined,
                }}
              >
                <p className="whitespace-pre-wrap">{textContent}</p>
              </div>
            </div>
          );
        })}
        {chat.status === "submitted" && (
          <div className="flex justify-start">
            <div className="bg-muted px-3.5 py-2.5 text-sm text-muted-foreground" style={{ borderRadius: 12 }}>
              {persona.name} is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t px-4 py-3 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${persona.name} a question...`}
            className="flex-1 border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.1)" }}
            disabled={
              chat.status === "streaming" || chat.status === "submitted"
            }
          />
          <Button
            type="submit"
            disabled={
              !inputValue.trim() ||
              chat.status === "streaming" ||
              chat.status === "submitted"
            }
            style={{ borderRadius: 12, backgroundColor: "#000531" }}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Panel Component
// ---------------------------------------------------------------------------
export function SynchronyPanel({ reportMd }: { reportMd: string }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: "#000531" }}
      >
        <div className="flex items-center gap-4">
          {/* DCP Logo Mark */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight" style={{ color: "#20FE8F" }}>
              DCP
            </span>
            <span
              className="pl-2 text-sm font-medium text-white"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.3)" }}
            >
              DonerColle Partners.
            </span>
          </div>
          <div className="hidden sm:block ml-2">
            <h1 className="text-base font-semibold tracking-tight text-white">
              Synchrony Elevation Brief
            </h1>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Audience Simulation Panel
            </p>
          </div>
        </div>
        <a
          href="/persona-guide.md"
          target="_blank"
          className="text-sm font-medium underline underline-offset-2 transition-colors hover:opacity-80"
          style={{ color: "#20FE8F" }}
        >
          Persona Guide
        </a>
      </header>

      {/* Tabs */}
      <Tabs defaultValue={0} className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-6 flex-shrink-0 bg-white">
          <TabsList variant="line">
            <TabsTrigger value={0}>Report</TabsTrigger>
            <TabsTrigger value={1}>Simulation Feed</TabsTrigger>
            <TabsTrigger value={2}>Analytics</TabsTrigger>
            <TabsTrigger value={3}>Chat with Panelists</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={0} className="flex-1 min-h-0">
          <ReportTab reportMd={reportMd} />
        </TabsContent>

        <TabsContent value={1} className="flex-1 min-h-0">
          <FeedTab />
        </TabsContent>

        <TabsContent value={2} className="flex-1 min-h-0 overflow-y-auto">
          <VisualizationsPanel />
        </TabsContent>

        <TabsContent value={3} className="flex-1 min-h-0">
          <ChatTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
