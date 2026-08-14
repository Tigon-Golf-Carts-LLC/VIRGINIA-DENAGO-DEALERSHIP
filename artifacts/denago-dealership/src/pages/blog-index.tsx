import { useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { getSortedPosts, POSTS_PER_PAGE } from '@/data/blog-posts';
import NotFound from './not-found';

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogIndex() {
  const params = useParams<{ page?: string }>();
  const posts = getSortedPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pageParamValid = params.page === undefined || /^[2-9]\d*$/.test(params.page);
  const page = params.page && pageParamValid ? parseInt(params.page, 10) : 1;

  const canonicalPath = page === 1 ? '/blog' : `/blog/page/${page}`;
  const prevPath = page === 2 ? '/blog' : page > 2 ? `/blog/page/${page - 1}` : null;
  const nextPath = page < totalPages ? `/blog/page/${page + 1}` : null;

  // rel=prev / rel=next link tags
  useEffect(() => {
    const tags: HTMLLinkElement[] = [];
    const addRel = (rel: string, href: string) => {
      const tag = document.createElement('link');
      tag.setAttribute('rel', rel);
      tag.setAttribute('href', `${DEALERSHIP.domain}${href}`);
      tag.setAttribute('data-blog-pagination', 'true');
      document.head.appendChild(tag);
      tags.push(tag);
    };
    if (prevPath) addRel('prev', prevPath);
    if (nextPath) addRel('next', nextPath);
    return () => tags.forEach((t) => t.remove());
  }, [prevPath, nextPath]);

  if (params.page !== undefined && (!pageParamValid || page > totalPages)) {
    return <NotFound />;
  }

  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <>
      <Seo
        title={page === 1 ? `Golf Cart Blog | ${DEALERSHIP.name}` : `Golf Cart Blog — Page ${page} | ${DEALERSHIP.name}`}
        description="Denago golf cart buying guides, financing explainers, street-legal rules, and city-by-city advice from the DENAGO Dealership team."
        url={`${DEALERSHIP.domain}${canonicalPath}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${DEALERSHIP.name} Blog`,
          url: `${DEALERSHIP.domain}/blog`,
          publisher: { '@type': 'Organization', name: DEALERSHIP.name, url: DEALERSHIP.domain },
        }}
      />

      <main className="flex-1 w-full">
        <div className="bg-secondary/40 border-b border-border">
          <div className="container mx-auto px-4 py-16 lg:py-20">
            <h1 className="text-4xl lg:text-6xl font-display font-bold uppercase tracking-tight mb-4">
              The DENAGO <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Buying guides, financing explainers, street-legal rules, and local advice from the team behind 16 Denago showrooms.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pagePosts.map((post) => (
              <article key={post.slug} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <Link href={`/blog/${post.slug}`} className="block aspect-video bg-muted overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${post.heroImage}`}
                    alt={post.heroAlt}
                    width="640"
                    height="360"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs font-semibold uppercase tracking-wider">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {post.targetCity ?? post.category}
                    </span>
                    <time dateTime={post.publishDate} className="text-muted-foreground">
                      {formatDate(post.publishDate)}
                    </time>
                  </div>
                  <h2 className="text-xl font-display font-bold leading-snug mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="text-primary font-bold text-sm uppercase tracking-wider hover:underline w-max">
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Blog pagination" className="flex items-center justify-center gap-2 mt-14">
              {prevPath ? (
                <Link href={prevPath} className="px-4 py-2 rounded-lg border border-border font-semibold text-sm hover:border-primary hover:text-primary transition-colors">
                  ← Previous
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg border border-border/50 text-muted-foreground/50 font-semibold text-sm" aria-disabled="true">
                  ← Previous
                </span>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                const href = n === 1 ? '/blog' : `/blog/page/${n}`;
                const isCurrent = n === page;
                return (
                  <Link
                    key={n}
                    href={href}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
              {nextPath ? (
                <Link href={nextPath} className="px-4 py-2 rounded-lg border border-border font-semibold text-sm hover:border-primary hover:text-primary transition-colors">
                  Next →
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg border border-border/50 text-muted-foreground/50 font-semibold text-sm" aria-disabled="true">
                  Next →
                </span>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
