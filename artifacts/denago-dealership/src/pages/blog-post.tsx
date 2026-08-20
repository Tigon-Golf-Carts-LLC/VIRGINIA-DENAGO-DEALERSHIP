import { Link, useParams } from 'wouter';
import { Seo } from '@/components/seo';
import { BlogMarkdown } from '@/components/blog-markdown';
import { DEALERSHIP } from '@/data/denago-models';
import { getPostBySlug, getRelatedPosts } from '@/data/blog-posts';
import NotFound from './not-found';
import { ChevronRight, Phone } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = params.slug ? getPostBySlug(params.slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  const postUrl = `${DEALERSHIP.domain}/blog/${post.slug}`;
  const heroUrl = `${DEALERSHIP.domain}${post.heroImage}`;
  const related = getRelatedPosts(post);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        image: heroUrl,
        datePublished: post.publishDate,
        dateModified: post.publishDate,
        author: { '@type': 'Organization', name: post.author, url: DEALERSHIP.domain },
        publisher: {
          '@type': 'Organization',
          name: DEALERSHIP.name,
          url: DEALERSHIP.domain,
          logo: { '@type': 'ImageObject', url: `${DEALERSHIP.domain}/brand/denago-logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
        keywords: post.tags.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: DEALERSHIP.domain },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${DEALERSHIP.domain}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
        ],
      },
    ],
  };

  return (
    <>
      <Seo
        title={post.seoTitle}
        description={post.metaDescription}
        url={postUrl}
        image={heroUrl}
        schema={schema}
      />

      <main className="flex-1 w-full">
        {/* Breadcrumb */}
        <div className="bg-secondary/40 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-semibold truncate max-w-[50vw]">{post.title}</span>
            </nav>
          </div>
        </div>

        <article className="pb-24">
          <div className="container mx-auto px-4 max-w-4xl pt-12">
            <div className="flex items-center gap-3 mb-5 text-xs font-semibold uppercase tracking-wider">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                {post.targetCity ?? post.category}
              </span>
              <time dateTime={post.publishDate} className="text-muted-foreground">
                {formatDate(post.publishDate)}
              </time>
              <span className="text-muted-foreground">· {post.author}</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-display font-bold uppercase tracking-tight leading-tight mb-8">
              {post.title}
            </h1>

            <div className="rounded-2xl overflow-hidden bg-muted shadow-xl mb-10 aspect-video">
              <img
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${post.heroImage}`}
                alt={post.heroAlt}
                width="1280"
                height="720"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>

            <BlogMarkdown markdown={post.body} />

            {/* CTA */}
            <div className="mt-14 bg-secondary/50 border border-border rounded-xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">
                  Ready to See One in Person?
                </h2>
                <p className="text-muted-foreground">
                  Test drive any Denago model at our <Link href="/locations" className="text-primary font-semibold hover:underline">Gloucester Point showroom</Link>, or ask about <Link href="/financing" className="text-primary font-semibold hover:underline">0% APR financing</Link>.
                </p>
              </div>
              <a
                href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-colors shadow-lg clip-path-slant shrink-0"
              >
                <Phone className="h-6 w-6" />
                {DEALERSHIP.phoneDisplay}
              </a>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-8">
                  Related <span className="text-primary">Articles</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="block bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${r.heroImage}`}
                          alt={r.heroAlt}
                          width="400"
                          height="225"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold leading-snug hover:text-primary transition-colors">
                          {r.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
