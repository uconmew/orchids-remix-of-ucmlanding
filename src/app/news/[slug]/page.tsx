"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  featuredImageUrl: string;
  publishedAt: string;
  createdAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string);
    }
  }, [params.slug]);

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      // Fetch all published posts
      const response = await fetch("/api/blog-posts?published=true");
      if (response.ok) {
        const posts = await response.json();
        const foundPost = posts.find((p: BlogPost) => p.slug === slug);
        
        if (foundPost) {
          setPost(foundPost);
          
          // Get related posts from same category
          const related = posts
            .filter((p: BlogPost) => p.category === foundPost.category && p.id !== foundPost.id)
            .slice(0, 3);
          setRelatedPosts(related);
        } else {
          router.push("/news");
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      news: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      testimony: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      update: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      announcement: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const sharePost = (platform: string) => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="h-96 bg-muted rounded" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-muted rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Article Header */}
      <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/news">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to News
            </Link>
          </Button>

          {/* Category Badge */}
          <Badge className={`mb-4 ${getCategoryColor(post.category)}`}>
            {post.category}
          </Badge>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm">Share:</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sharePost("facebook")}
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sharePost("twitter")}
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sharePost("linkedin")}
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImageUrl && (
            <div className="relative w-full h-96 mb-12 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 fade-in">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="hover-lift">
                  <div className="relative w-full h-48">
                    <Image
                      src={relatedPost.featuredImageUrl || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"}
                      alt={relatedPost.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <Badge className={`w-fit mb-2 ${getCategoryColor(relatedPost.category)}`}>
                      {relatedPost.category}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">
                      {relatedPost.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link href={`/news/${relatedPost.slug}`}>
                        Read More →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get Involved</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join us in transforming lives and building community. There are many ways to support our mission.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/volunteer">Volunteer</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/donations">Donate</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
