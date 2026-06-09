import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS, type BlogPost } from "./blog";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await apiClient.get(`/blogs/${params.slug}`);
      if (res?.success && res?.data) {
        const b = res.data;
        const post: BlogPost = {
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt || b.content.substring(0, 150) + "...",
          content: b.content,
          image: b.featuredImage,
          category: b.metaTitle || "Editorial",
          date: new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          readTime: "5 min read",
          author: b.author || "Editor"
        };
        return { post };
      }
    } catch (err) {
      console.warn("Blog post not found in backend, falling back to static", err);
    }
    const post = BLOG_POSTS.find((x) => x.slug === params.slug);
    return { post: post || null };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    return {
      meta: [
        { title: post ? `${post.title} — Giftcy Stories` : "Blog — Giftcy" },
        { name: "description", content: post ? post.excerpt : "Giftcy editorial stories." },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData() as { post: BlogPost | null };

  if (!post) {
    return (
      <div className="py-32 text-center px-5">
        <h1 className="serif text-4xl">Article not found</h1>
        <p className="mt-3 text-muted-foreground">The story you're looking for doesn't exist.</p>
        <Link to="/blog" className="mt-6 inline-flex px-6 py-3 rounded-full border border-gold text-gold text-sm">Back to stories</Link>
      </div>
    );
  }

  // Find related articles (excluding the active one)
  const related = BLOG_POSTS.filter((x) => x.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article className="mx-auto max-w-3xl px-5 lg:px-10 py-12 lg:py-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to stories
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold font-semibold uppercase tracking-wider text-[10px]">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="serif text-4xl lg:text-5xl font-semibold leading-tight text-balance">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/60">
            <div className="h-10 w-10 rounded-full bg-cream flex items-center justify-center font-bold text-gold text-sm border border-border">
              {post.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{post.author}</p>
              <p className="text-[10px] text-muted-foreground">Editorial Contributor</p>
            </div>
          </div>
        </header>

        <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-border bg-cream mb-10 shadow-soft">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>

        {/* Rich text post body */}
        <div className="prose prose-stone prose-gold max-w-none text-foreground/90 leading-relaxed text-base space-y-6">
          {post.content.split("\n\n").map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.startsWith("###")) {
              return <h3 key={i} className="serif text-2xl font-semibold text-foreground pt-4">{trimmed.replace("###", "").trim()}</h3>;
            }
            if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.") || trimmed.startsWith("5.")) {
              return (
                <div key={i} className="pl-4 border-l-2 border-gold/40 py-1 text-sm text-muted-foreground italic">
                  {trimmed}
                </div>
              );
            }
            return <p key={i} className="text-justify leading-relaxed whitespace-pre-line">{trimmed}</p>;
          })}
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-cream/35 border-t border-border py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-10">
            <h3 className="serif text-2xl mb-8 font-semibold">Related Stories</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {related.map((post) => (
                <Link
                  key={post.slug}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex flex-col rounded-[2rem] overflow-hidden border border-border bg-background hover:shadow-soft transition duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="px-2 py-0.5 rounded-full border border-border text-[9px] uppercase font-semibold">{post.category}</span>
                      </div>
                      <h4 className="serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">{post.title}</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

