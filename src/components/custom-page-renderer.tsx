import { Star, CheckCircle, Play, Zap, HelpCircle, ChevronDown } from "lucide-react";

interface SectionConfig {
  type: string;
  config: Record<string, string | number | boolean>;
}

interface CustomPageRendererProps {
  layout: { sections: SectionConfig[] };
  theme: string;
  productName: string;
  productDescription: string;
  brandName?: string;
  brandContentPosts: Array<{
    id: string;
    title: string;
    coverUrl: string | null;
    mediaUrl: string;
  }>;
  reviews: Array<{
    userName: string;
    rating: number;
    content: string;
  }>;
  functionTags: string[];
}

function getThemeClasses(theme: string) {
  switch (theme) {
    case "dark":
      return {
        bg: "bg-gray-950",
        text: "text-white",
        muted: "text-gray-400",
        accent: "text-blue-400",
        card: "bg-gray-900 border-gray-800",
        divider: "border-gray-800",
      };
    case "brand":
      return {
        bg: "bg-blue-950",
        text: "text-white",
        muted: "text-blue-200",
        accent: "text-blue-300",
        card: "bg-blue-900/50 border-blue-800",
        divider: "border-blue-800",
      };
    case "minimal":
      return {
        bg: "bg-white",
        text: "text-gray-900",
        muted: "text-gray-500",
        accent: "text-gray-900",
        card: "bg-gray-50 border-gray-200",
        divider: "border-gray-200",
      };
    default:
      return {
        bg: "bg-white",
        text: "text-gray-900",
        muted: "text-gray-600",
        accent: "text-blue-600",
        card: "bg-gray-50 border-gray-200",
        divider: "border-gray-200",
      };
  }
}

export function CustomPageRenderer({
  layout,
  theme,
  productName,
  productDescription,
  brandName,
  brandContentPosts,
  reviews,
  functionTags,
}: CustomPageRendererProps) {
  const t = getThemeClasses(theme);

  return (
    <div className={t.bg}>
      {layout.sections.map((section, idx) => {
        switch (section.type) {
          case "hero":
            return (
              <HeroSection
                key={idx}
                headline={section.config.headline as string}
                subtext={section.config.subtext as string}
                bgColor={section.config.bgColor as string}
                theme={t}
                productName={productName}
              />
            );
          case "video_demo":
            return (
              <VideoDemoSection
                key={idx}
                title={(section.config.title as string) || "See it in action"}
                theme={t}
                videos={brandContentPosts}
              />
            );
          case "features_grid":
            return (
              <FeaturesGridSection
                key={idx}
                columns={(section.config.columns as number) || 3}
                theme={t}
                features={functionTags}
                productDescription={productDescription}
              />
            );
          case "testimonials":
            return (
              <TestimonialsSection
                key={idx}
                limit={(section.config.limit as number) || 6}
                theme={t}
                reviews={reviews}
              />
            );
          case "comparison_table":
            return (
              <ComparisonSection key={idx} theme={t} productName={productName} />
            );
          case "faq":
            return <FaqSection key={idx} theme={t} productName={productName} />;
          default:
            return null;
        }
      })}

      {/* Merchant page footer */}
      <div className={`text-center py-6 border-t ${t.divider}`}>
        <p className={`text-xs ${t.muted}`}>
          Custom page by {brandName || "Merchant"} &middot; Claims reviewed by
          LeagueShop
        </p>
      </div>
    </div>
  );
}

/* ====== Section Components ====== */

function HeroSection({
  headline,
  subtext,
  bgColor,
  theme,
  productName,
}: {
  headline?: string;
  subtext?: string;
  bgColor?: string;
  theme: ReturnType<typeof getThemeClasses>;
  productName: string;
}) {
  return (
    <div
      className="py-20 px-4 text-center"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <h2
        className={`text-3xl sm:text-4xl font-bold mb-4 ${
          bgColor ? "text-white" : theme.text
        }`}
      >
        {headline || productName}
      </h2>
      {subtext && (
        <p
          className={`text-lg max-w-2xl mx-auto ${
            bgColor ? "text-gray-300" : theme.muted
          }`}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

function VideoDemoSection({
  title,
  theme,
  videos,
}: {
  title: string;
  theme: ReturnType<typeof getThemeClasses>;
  videos: Array<{
    id: string;
    title: string;
    coverUrl: string | null;
    mediaUrl: string;
  }>;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <h3 className={`text-2xl font-bold text-center mb-8 ${theme.text}`}>
        {title}
      </h3>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`rounded-xl border overflow-hidden ${theme.card}`}
            >
              <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                {video.coverUrl ? (
                  <img
                    src={video.coverUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-10 h-10 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className={`text-sm font-medium ${theme.text}`}>
                  {video.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`aspect-video max-w-2xl mx-auto rounded-xl border flex items-center justify-center ${theme.card}`}
        >
          <div className="text-center">
            <Play className={`w-12 h-12 mx-auto mb-2 ${theme.muted}`} />
            <p className={`text-sm ${theme.muted}`}>Demo video coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeaturesGridSection({
  columns,
  theme,
  features,
  productDescription,
}: {
  columns: number;
  theme: ReturnType<typeof getThemeClasses>;
  features: string[];
  productDescription: string;
}) {
  // If no features, use description sentences as features
  const items =
    features.length > 0
      ? features
      : productDescription
          .split(/[.!]/)
          .filter((s) => s.trim().length > 10)
          .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <h3 className={`text-2xl font-bold text-center mb-8 ${theme.text}`}>
        Why choose this product
      </h3>
      <div
        className={`grid gap-4`}
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`,
        }}
      >
        {items.map((feature, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-5 ${theme.card}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                theme.bg === "bg-white" ? "bg-blue-100" : "bg-white/10"
              }`}
            >
              <Zap
                className={`w-4 h-4 ${
                  theme.bg === "bg-white" ? "text-blue-600" : "text-blue-300"
                }`}
              />
            </div>
            <p className={`text-sm font-medium ${theme.text}`}>
              {feature.trim()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsSection({
  limit,
  theme,
  reviews,
}: {
  limit: number;
  theme: ReturnType<typeof getThemeClasses>;
  reviews: Array<{ userName: string; rating: number; content: string }>;
}) {
  const shown = reviews.slice(0, limit);

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <h3 className={`text-2xl font-bold text-center mb-8 ${theme.text}`}>
        What customers say
      </h3>
      {shown.length === 0 ? (
        <p className={`text-sm text-center py-8 ${theme.muted}`}>
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((review, idx) => (
            <div key={idx} className={`rounded-xl border p-5 ${theme.card}`}>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-sm mb-3 leading-relaxed line-clamp-4 ${theme.text}`}>
                &ldquo;{review.content}&rdquo;
              </p>
              <p className={`text-xs font-medium ${theme.muted}`}>
                &mdash; {review.userName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparisonSection({
  theme,
  productName,
}: {
  theme: ReturnType<typeof getThemeClasses>;
  productName: string;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h3 className={`text-2xl font-bold text-center mb-8 ${theme.text}`}>
        How we compare
      </h3>
      <div className={`rounded-xl border overflow-hidden ${theme.card}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${theme.divider}`}>
              <th className={`text-left px-4 py-3 font-medium ${theme.muted}`}>
                Feature
              </th>
              <th className={`text-center px-4 py-3 font-bold ${theme.accent}`}>
                {productName}
              </th>
              <th className={`text-center px-4 py-3 font-medium ${theme.muted}`}>
                Others
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              "Evidence Verified",
              "League Ranked",
              "VAR Protected",
              "Real User Data",
            ].map((feature) => (
              <tr key={feature} className={`border-b ${theme.divider}`}>
                <td className={`px-4 py-3 ${theme.text}`}>{feature}</td>
                <td className="px-4 py-3 text-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                </td>
                <td className={`px-4 py-3 text-center ${theme.muted}`}>
                  &mdash;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FaqSection({
  theme,
  productName,
}: {
  theme: ReturnType<typeof getThemeClasses>;
  productName: string;
}) {
  const faqs = [
    {
      q: `What makes ${productName} different?`,
      a: "Our products are ranked through real evidence from verified buyers, not paid reviews or ads.",
    },
    {
      q: "How does the league ranking work?",
      a: "Products compete in leagues. Real evidence from buyers affects the ranking. Higher evidence quality = higher rank.",
    },
    {
      q: "What is VAR protection?",
      a: "Like video replay in sports, our VAR system catches fake reviews and misleading claims to protect buyers.",
    },
    {
      q: "Can I return this product?",
      a: "Yes, all products have standard return policies. Your return experience also becomes evidence in the league.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h3 className={`text-2xl font-bold text-center mb-8 ${theme.text}`}>
        Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className={`rounded-xl border group ${theme.card}`}
          >
            <summary
              className={`flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium ${theme.text}`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className={`w-4 h-4 ${theme.muted}`} />
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform group-open:rotate-180 ${theme.muted}`}
              />
            </summary>
            <div className={`px-5 pb-4 text-sm leading-relaxed ${theme.muted}`}>
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
