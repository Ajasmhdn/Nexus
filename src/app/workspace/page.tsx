import WorkspaceClient from "@/components/workspace/WorkspaceClient";

interface PageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

/**
 * Workspace Page (Next.js Server Component)
 * Resolves search parameters and mounts the interactive client state wrapper.
 */
export default async function WorkspacePage({ searchParams }: PageProps) {
  const { sessionId = "" } = await searchParams;
  return <WorkspaceClient initialSessionId={sessionId || null} />;
}
