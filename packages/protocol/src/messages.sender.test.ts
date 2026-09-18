import { MessageSenderSchema, SendAgentMessageRequestSchema } from "./messages";
import { describe, expect, it } from "vitest";

const baseRequest = {
  type: "send_agent_message_request",
  requestId: "request-1",
  agentId: "agent-1",
  text: "Build the feature",
} as const;

describe("send_agent_message_request sender attribution", () => {
  it("round-trips a sibling-agent sender with agentId, label, and kind", () => {
    const parsed = SendAgentMessageRequestSchema.parse({
      ...baseRequest,
      sender: {
        agentId: "caller-agent",
        label: "Front Desk",
        kind: "agent",
      },
    });

    expect(parsed.sender).toEqual({
      agentId: "caller-agent",
      label: "Front Desk",
      kind: "agent",
    });
  });

  it("accepts an operator sender with only a kind", () => {
    const parsed = SendAgentMessageRequestSchema.parse({
      ...baseRequest,
      sender: { kind: "operator" },
    });

    expect(parsed.sender).toEqual({ kind: "operator" });
    expect(parsed.sender?.agentId).toBeUndefined();
    expect(parsed.sender?.label).toBeUndefined();
  });

  it("keeps old behaviour when sender is absent", () => {
    const parsed = SendAgentMessageRequestSchema.parse(baseRequest);
    expect(parsed.sender).toBeUndefined();
  });

  it("rejects an unknown sender kind", () => {
    expect(() =>
      SendAgentMessageRequestSchema.parse({
        ...baseRequest,
        sender: { kind: "extraterrestrial" },
      }),
    ).toThrow();
  });

  it("accepts all three sender kinds at the schema level", () => {
    for (const kind of ["operator", "front_desk", "agent"] as const) {
      expect(MessageSenderSchema.parse({ kind }).kind).toBe(kind);
    }
  });
});
