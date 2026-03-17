import type { InferPageType } from "fumadocs-core/source";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { notFound, redirect } from "next/navigation";
import type { MDXContent } from "mdx/types";
import type { TOCItemType } from "fumadocs-core/toc";
import { LLMCopyButton, ViewOptions } from "./page.client";
import { DocsToc } from "@/components/docs/docs-toc";
import { AnchorProvider } from "fumadocs-core/toc";

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
    <AnchorProvider toc={page.data.toc}>
      <div className="flex gap-10">
        <article className="min-w-0 flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-fd-foreground">
              {page.data.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <LLMCopyButton rawUrl={rawUrl} />
              <ViewOptions
                markdownUrl={`${page.url}.mdx`}
                githubUrl={githubUrl}
              />
            </div>
          </div>
          {page.data.description && (
            <p className="mb-6 text-fd-muted-foreground text-[15px] leading-relaxed">
              {page.data.description}
            </p>
          )}
          <div className="relative mb-8">
            <div className="h-px bg-fd-border" />
          </div>
          <div className="prose prose-fd min-w-0 max-w-none">
            <MDX components={getMDXComponents()} />
          </div>
        </article>

        {page.data.toc.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0 sticky top-[calc(41px+2.5rem)] self-start max-h-[calc(100dvh-41px-5rem-2rem)] overflow-y-auto no-scrollbar">
            <DocsToc toc={page.data.toc} />
          </aside>
        )}
      </div>
    </AnchorProvider>
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
