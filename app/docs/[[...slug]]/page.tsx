import type { InferPageType } from "fumadocs-core/source";
import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/notebook/page";
import { getMDXComponents } from "@/mdx-components";
import { notFound, redirect } from "next/navigation";
import type { MDXContent } from "mdx/types";
import type { TOCItemType } from "fumadocs-core/toc";
import { LLMCopyButton, ViewOptions } from "./page.client";

type PageData = InferPageType<typeof source> & {
  data: {
    body: MDXContent;
    toc: TOCItemType[];
  };
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) {
    redirect("/docs/introduction");
  }
  const page = source.getPage(params.slug) as PageData | undefined;
  if (!page) notFound();

  const MDX = page.data.body;
  const filePath = `content/docs/${params.slug.join("/")}.mdx`;
  const rawUrl = `https://raw.githubusercontent.com/better-auth/agent-auth-protocol/main/${filePath}`;
  const githubUrl = `https://github.com/better-auth/agent-auth-protocol/blob/main/${filePath}`;

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{ style: "clerk" }}
      editOnGithub={{
        owner: "better-auth",
        repo: "agent-auth-protocol",
        sha: "main",
        path: filePath,
      }}
    >
      <div className="flex items-center justify-between gap-4 pb-4">
        <DocsTitle className="mb-0">{page.data.title}</DocsTitle>
        <div className="flex items-center gap-2 not-prose shrink-0">
          <LLMCopyButton rawUrl={rawUrl} />
          <ViewOptions markdownUrl={`${page.url}.mdx`} githubUrl={githubUrl} />
        </div>
      </div>
      {page.data.description && (
        <DocsDescription>{page.data.description}</DocsDescription>
      )}
      <div className="relative mb-8">
        <div className="h-px bg-fd-border" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-px h-1.5 bg-fd-foreground/30" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-1.5 bg-fd-foreground/30" />
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 h-px w-1.5 bg-fd-foreground/30" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-px w-1.5 bg-fd-foreground/30" />
        </div>
      </div>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
