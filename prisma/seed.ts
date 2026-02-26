import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.challengeEntry.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.pkMatch.deleteMany();
  await prisma.contentComment.deleteMany();
  await prisma.contentMetrics.deleteMany();
  await prisma.contentPost.deleteMany();
  await prisma.evidencePost.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.creditsLedger.deleteMany();
  await prisma.return.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.varCase.deleteMany();
  await prisma.productLeagueStatus.deleteMany();
  await prisma.customProductPage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.brandAmbassador.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.season.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.league.deleteMany();
  await prisma.user.deleteMany();

  // ===== USERS =====
  const users = await Promise.all([
    prisma.user.create({
      data: { id: "user1", email: "alice@example.com", name: "Alice Chen", role: "user", passwordHash: "hashed_pw", avatarUrl: "/avatars/alice.jpg" },
    }),
    prisma.user.create({
      data: { id: "user2", email: "bob@example.com", name: "Bob Wang", role: "user", passwordHash: "hashed_pw", avatarUrl: "/avatars/bob.jpg" },
    }),
    prisma.user.create({
      data: { id: "user3", email: "carol@example.com", name: "Carol Li", role: "user", passwordHash: "hashed_pw", avatarUrl: "/avatars/carol.jpg" },
    }),
    prisma.user.create({
      data: { id: "merchant1", email: "merchant1@example.com", name: "David Zhang", role: "merchant", passwordHash: "hashed_pw" },
    }),
    prisma.user.create({
      data: { id: "merchant2", email: "merchant2@example.com", name: "Eva Liu", role: "merchant", passwordHash: "hashed_pw" },
    }),
    prisma.user.create({
      data: { id: "merchant3", email: "merchant3@example.com", name: "Frank Wu", role: "merchant", passwordHash: "hashed_pw" },
    }),
    prisma.user.create({
      data: { id: "merchant4", email: "merchant4@example.com", name: "Grace Huang", role: "merchant", passwordHash: "hashed_pw" },
    }),
    prisma.user.create({
      data: { id: "merchant5", email: "merchant5@example.com", name: "Henry Zhao", role: "merchant", passwordHash: "hashed_pw" },
    }),
    prisma.user.create({
      data: { id: "merchant6", email: "merchant6@example.com", name: "Ivy Sun", role: "merchant", passwordHash: "hashed_pw" },
    }),
    prisma.user.create({
      data: { id: "admin1", email: "admin@leagueshop.com", name: "Admin", role: "admin", passwordHash: "hashed_pw" },
    }),
  ]);

  // ===== MERCHANTS & BRANDS =====
  const merchantData = [
    { id: "m1", userId: "merchant1", businessName: "CleanMaster Pro", brandName: "CleanMaster", styleTags: '["performance","value"]' },
    { id: "m2", userId: "merchant2", businessName: "EcoHome Living", brandName: "EcoHome", styleTags: '["eco","minimalist"]' },
    { id: "m3", userId: "merchant3", businessName: "KitchenGenius Inc", brandName: "KitchenGenius", styleTags: '["innovative","durable"]' },
    { id: "m4", userId: "merchant4", businessName: "FreshAir Tech", brandName: "FreshAir", styleTags: '["tech","premium"]' },
    { id: "m5", userId: "merchant5", businessName: "SparkleClean Co", brandName: "SparkleClean", styleTags: '["value","effective"]' },
    { id: "m6", userId: "merchant6", businessName: "ZenKitchen", brandName: "ZenKitchen", styleTags: '["minimalist","premium","durable"]' },
  ];

  for (const md of merchantData) {
    await prisma.merchant.create({
      data: {
        id: md.id, userId: md.userId, businessName: md.businessName, verified: true,
        brand: { create: { id: `b${md.id.slice(1)}`, name: md.brandName, styleTags: md.styleTags } },
      },
    });
  }

  // ===== LEAGUES =====
  const leagues = await Promise.all([
    prisma.league.create({
      data: {
        id: "league1", name: "Kitchen Effortless", slug: "kitchen-effortless",
        description: "Find the best kitchen gadgets that save you time and effort",
        painPoint: "Cooking takes too long and kitchen cleanup is exhausting",
        seasons: { create: { id: "s1", name: "2026 Spring", startDate: new Date("2026-01-01"), endDate: new Date("2026-06-30"), isCurrent: true } },
      },
    }),
    prisma.league.create({
      data: {
        id: "league2", name: "Cleaning Power", slug: "cleaning-power",
        description: "Discover the most effective cleaning solutions for every surface",
        painPoint: "Stubborn stains, odors, and grime that won't go away",
        seasons: { create: { id: "s2", name: "2026 Spring", startDate: new Date("2026-01-01"), endDate: new Date("2026-06-30"), isCurrent: true } },
      },
    }),
  ]);

  // ===== PRODUCTS (Kitchen League) =====
  const kitchenProducts = [
    { id: "p1", merchantId: "m3", brandId: "b3", name: "AutoStir Pro 3000", slug: "autostir-pro-3000", description: "Automatic stirring device that frees your hands while cooking. 360° rotation, adjustable speed, fits any pot.", price: 49.99, compareAtPrice: 69.99, imageUrl: "/products/autostir.jpg", functionTags: '["auto-stir","hands-free","adjustable-speed"]', sceneTags: '["busy-kitchen","multitask-cooking"]' },
    { id: "p2", merchantId: "m6", brandId: "b6", name: "ZenChop Smart Cutting Board", slug: "zenchop-smart-board", description: "Anti-bacterial cutting board with built-in scale, timer, and waste collector. One surface for everything.", price: 79.99, imageUrl: "/products/zenchop.jpg", functionTags: '["anti-bacterial","built-in-scale","waste-collector"]', sceneTags: '["small-kitchen","meal-prep"]' },
    { id: "p3", merchantId: "m1", brandId: "b1", name: "QuickDrain Colander Plus", slug: "quickdrain-colander", description: "One-click drain colander that clips onto any pot. No more juggling hot pots and colanders.", price: 24.99, imageUrl: "/products/quickdrain.jpg", functionTags: '["one-click-drain","clip-on","heat-resistant"]', sceneTags: '["small-kitchen","rental","quick-meals"]' },
    { id: "p4", merchantId: "m2", brandId: "b2", name: "EcoScrub Bamboo Set", slug: "ecoscrub-bamboo-set", description: "100% biodegradable bamboo scrubbing set. Tough on grease, gentle on surfaces, zero waste.", price: 18.99, imageUrl: "/products/ecoscrub.jpg", functionTags: '["biodegradable","non-scratch","grease-cutting"]', sceneTags: '["eco-conscious","daily-cleaning"]' },
    { id: "p5", merchantId: "m3", brandId: "b3", name: "InstaPeel Veggie Glove", slug: "instapeel-glove", description: "Wear it, rub the vegetable, skin comes off. Peel potatoes in 10 seconds.", price: 12.99, imageUrl: "/products/instapeel.jpg", functionTags: '["fast-peel","wearable","easy-clean"]', sceneTags: '["quick-meals","family-cooking","kids-help"]', riskTags: '["size-note"]' },
    { id: "p6", merchantId: "m4", brandId: "b4", name: "FreshSeal Vacuum Lid Set", slug: "freshseal-vacuum-lids", description: "Universal silicone lids that create vacuum seal on any container. Keep food fresh 5x longer.", price: 29.99, imageUrl: "/products/freshseal.jpg", functionTags: '["vacuum-seal","universal-fit","reusable"]', sceneTags: '["meal-prep","leftovers","small-kitchen"]' },
  ];

  // ===== PRODUCTS (Cleaning League) =====
  const cleaningProducts = [
    { id: "p7", merchantId: "m1", brandId: "b1", name: "CleanMaster Ultra Degreaser", slug: "cleanmaster-degreaser", description: "Industrial-strength degreaser safe for home use. Cuts through years of kitchen grease in seconds.", price: 15.99, imageUrl: "/products/degreaser.jpg", functionTags: '["industrial-strength","safe-for-home","instant-action"]', sceneTags: '["kitchen-deep-clean","rental-move-out"]' },
    { id: "p8", merchantId: "m5", brandId: "b5", name: "SparkleClean Magic Eraser XL", slug: "sparkle-magic-eraser", description: "Extra-large magic eraser pads that remove scuffs, marks, and stains from any surface without chemicals.", price: 9.99, imageUrl: "/products/magic-eraser.jpg", functionTags: '["chemical-free","multi-surface","extra-large"]', sceneTags: '["wall-marks","shoe-scuffs","bathroom"]' },
    { id: "p9", merchantId: "m4", brandId: "b4", name: "FreshAir Odor Eliminator", slug: "freshair-odor-eliminator", description: "Bio-enzyme odor eliminator that destroys smell molecules, not just masks them. Works on pet, smoke, cooking odors.", price: 22.99, imageUrl: "/products/odor-eliminator.jpg", functionTags: '["bio-enzyme","permanent-removal","pet-safe"]', sceneTags: '["pet-family","cooking-odor","bathroom-odor"]' },
    { id: "p10", merchantId: "m2", brandId: "b2", name: "EcoHome Steam Mop Pro", slug: "ecohome-steam-mop", description: "Chemical-free steam mop that sanitizes floors with 99.9% germ kill rate. Lightweight and fast-heating.", price: 89.99, compareAtPrice: 119.99, imageUrl: "/products/steam-mop.jpg", functionTags: '["chemical-free","99.9%-sanitize","fast-heating"]', sceneTags: '["family-home","pet-family","allergy-prone"]' },
    { id: "p11", merchantId: "m5", brandId: "b5", name: "SparkleClean Grout Reviver", slug: "sparkle-grout-reviver", description: "Grout cleaning gel with precision applicator. Restores grout to original white in one application.", price: 14.99, imageUrl: "/products/grout-reviver.jpg", functionTags: '["precision-applicator","one-application","whitening"]', sceneTags: '["bathroom","kitchen-tiles","rental-move-out"]' },
    { id: "p12", merchantId: "m6", brandId: "b6", name: "ZenClean Robot Scrubber", slug: "zenclean-robot-scrubber", description: "Compact robot that scrubs bathroom tiles and tub automatically. Set it and forget it.", price: 149.99, imageUrl: "/products/robot-scrubber.jpg", functionTags: '["automatic","compact","waterproof"]', sceneTags: '["bathroom","hands-free","tech-lover"]', riskTags: '["insufficient-data"]' },
  ];

  for (const p of [...kitchenProducts, ...cleaningProducts]) {
    await prisma.product.create({ data: p });
  }

  // ===== PRODUCT LEAGUE STATUS =====
  const kitchenStatuses = [
    { productId: "p1", leagueId: "league1", div: 1, rankScore: 88, hypeScore: 82, proofScore: 91, evidenceCount: 47, returnRate: 0.02, varStatus: "clear" },
    { productId: "p2", leagueId: "league1", div: 1, rankScore: 85, hypeScore: 90, proofScore: 83, evidenceCount: 38, returnRate: 0.03, varStatus: "verified" },
    { productId: "p3", leagueId: "league1", div: 1, rankScore: 82, hypeScore: 78, proofScore: 84, evidenceCount: 55, returnRate: 0.01, varStatus: "clear" },
    { productId: "p4", leagueId: "league1", div: 2, rankScore: 71, hypeScore: 65, proofScore: 74, evidenceCount: 22, returnRate: 0.04, varStatus: "clear" },
    { productId: "p5", leagueId: "league1", div: 2, rankScore: 68, hypeScore: 72, proofScore: 66, evidenceCount: 18, returnRate: 0.05, varStatus: "clear" },
    { productId: "p6", leagueId: "league1", div: 3, rankScore: 45, hypeScore: 52, proofScore: 42, evidenceCount: 8, returnRate: 0.08, varStatus: "clear" },
  ];

  const cleaningStatuses = [
    { productId: "p7", leagueId: "league2", div: 1, rankScore: 91, hypeScore: 85, proofScore: 94, evidenceCount: 62, returnRate: 0.01, varStatus: "clear" },
    { productId: "p8", leagueId: "league2", div: 1, rankScore: 87, hypeScore: 88, proofScore: 87, evidenceCount: 45, returnRate: 0.02, varStatus: "clear" },
    { productId: "p10", leagueId: "league2", div: 1, rankScore: 84, hypeScore: 80, proofScore: 86, evidenceCount: 33, returnRate: 0.03, varStatus: "clear" },
    { productId: "p9", leagueId: "league2", div: 2, rankScore: 72, hypeScore: 68, proofScore: 74, evidenceCount: 20, returnRate: 0.04, varStatus: "clear" },
    { productId: "p11", leagueId: "league2", div: 2, rankScore: 65, hypeScore: 70, proofScore: 63, evidenceCount: 14, returnRate: 0.06, varStatus: "under_review" },
    { productId: "p12", leagueId: "league2", div: 3, rankScore: 38, hypeScore: 45, proofScore: 35, evidenceCount: 5, returnRate: 0.10, varStatus: "clear" },
  ];

  for (const s of [...kitchenStatuses, ...cleaningStatuses]) {
    await prisma.productLeagueStatus.create({ data: s });
  }

  // ===== ORDERS =====
  const orders = [
    { id: "order1", userId: "user1", status: "completed", totalAmount: 49.99, commissionAmount: 7.50, shippingAddress: "123 Main St" },
    { id: "order2", userId: "user1", status: "completed", totalAmount: 24.99, commissionAmount: 3.75, shippingAddress: "123 Main St" },
    { id: "order3", userId: "user2", status: "completed", totalAmount: 15.99, commissionAmount: 2.40, shippingAddress: "456 Oak Ave" },
    { id: "order4", userId: "user2", status: "delivered", totalAmount: 89.99, commissionAmount: 13.50, shippingAddress: "456 Oak Ave" },
    { id: "order5", userId: "user3", status: "completed", totalAmount: 79.99, commissionAmount: 12.00, shippingAddress: "789 Pine Rd" },
    { id: "order6", userId: "user3", status: "shipped", totalAmount: 22.99, commissionAmount: 3.45, shippingAddress: "789 Pine Rd" },
  ];

  for (const o of orders) {
    await prisma.order.create({ data: o });
  }

  // ===== ORDER ITEMS =====
  const orderItems = [
    { id: "oi1", orderId: "order1", productId: "p1", quantity: 1, unitPrice: 49.99, totalPrice: 49.99 },
    { id: "oi2", orderId: "order2", productId: "p3", quantity: 1, unitPrice: 24.99, totalPrice: 24.99 },
    { id: "oi3", orderId: "order3", productId: "p7", quantity: 1, unitPrice: 15.99, totalPrice: 15.99 },
    { id: "oi4", orderId: "order4", productId: "p10", quantity: 1, unitPrice: 89.99, totalPrice: 89.99 },
    { id: "oi5", orderId: "order5", productId: "p2", quantity: 1, unitPrice: 79.99, totalPrice: 79.99 },
    { id: "oi6", orderId: "order6", productId: "p9", quantity: 1, unitPrice: 22.99, totalPrice: 22.99 },
  ];

  for (const oi of orderItems) {
    await prisma.orderItem.create({ data: oi });
  }

  // ===== REVIEWS =====
  const reviews = [
    { userId: "user1", productId: "p1", orderItemId: "oi1", rating: 5, title: "Game changer!", content: "Finally I can stir soup while chopping veggies. This thing is amazing.", weight: 1.0 },
    { userId: "user1", productId: "p3", orderItemId: "oi2", rating: 4, title: "Simple but effective", content: "Clips on perfectly, drains fast. Wish it came in more colors.", weight: 1.0 },
    { userId: "user2", productId: "p7", orderItemId: "oi3", rating: 5, title: "Destroyed 10 years of grease", content: "Used it on my old oven hood. Unbelievable results.", weight: 1.0 },
    { userId: "user2", productId: "p10", orderItemId: "oi4", rating: 4, title: "Great for pet owners", content: "Floors feel genuinely clean. My dog doesn't slip anymore either.", weight: 1.0 },
    { userId: "user3", productId: "p2", orderItemId: "oi5", rating: 5, title: "Worth every penny", content: "The built-in scale is so convenient. Waste collector is genius.", weight: 1.0 },
  ];

  for (const r of reviews) {
    await prisma.review.create({ data: r });
  }

  // ===== VOTES =====
  const votes = [
    { userId: "user1", productId: "p1", type: "purchase", weight: 1.0, value: 1 },
    { userId: "user1", productId: "p7", type: "interactive", weight: 0.5, value: 1 },
    { userId: "user2", productId: "p7", type: "purchase", weight: 1.0, value: 1 },
    { userId: "user2", productId: "p1", type: "passerby", weight: 0.2, value: 1 },
    { userId: "user3", productId: "p2", type: "purchase", weight: 1.0, value: 1 },
    { userId: "user3", productId: "p8", type: "interactive", weight: 0.5, value: 1 },
  ];

  for (const v of votes) {
    await prisma.vote.create({ data: v });
  }

  // ===== EVIDENCE POSTS =====
  const evidencePosts = [
    { userId: "user1", productId: "p1", orderItemId: "oi1", mediaType: "video", mediaUrl: "/evidence/autostir-review.mp4", coverUrl: "/evidence/autostir-cover.jpg", title: "30 days with AutoStir - real kitchen test", description: "Used it every day for a month making soups, sauces, and porridge.", structuredTags: '{"duration":"30days","scenario":"daily_cooking","verdict":"strongly_recommended"}', weight: 3.0, status: "verified" },
    { userId: "user2", productId: "p7", orderItemId: "oi3", mediaType: "image", mediaUrl: "/evidence/degreaser-before-after.jpg", title: "Before/After: 10-year-old grease", description: "Left side before, right side after one spray. No scrubbing needed.", structuredTags: '{"duration":"instant","scenario":"deep_clean","verdict":"strongly_recommended"}', weight: 2.5, status: "verified" },
    { userId: "user3", productId: "p2", orderItemId: "oi5", mediaType: "video", mediaUrl: "/evidence/zenchop-demo.mp4", coverUrl: "/evidence/zenchop-cover.jpg", title: "ZenChop in a tiny apartment kitchen", description: "Showing how the board saves counter space with its built-in features.", structuredTags: '{"duration":"14days","scenario":"small_kitchen","verdict":"recommended"}', weight: 2.0, status: "verified" },
  ];

  for (const ep of evidencePosts) {
    await prisma.evidencePost.create({ data: ep });
  }

  // ===== CONTENT POSTS =====
  const contentPosts = [
    // Shorts
    { id: "cp1", authorId: "merchant1", source: "brand", type: "short", title: "CleanMaster Degreaser - 5 Second Demo", mediaUrl: "/content/degreaser-demo.mp4", coverUrl: "/content/degreaser-demo-cover.jpg", duration: 12, leagueId: "league2", productId: "p7", brandId: "b1", tags: '["demo","before-after","kitchen"]' },
    { id: "cp2", authorId: "user1", source: "user", type: "short", title: "POV: Your soup stirs itself", mediaUrl: "/content/autostir-funny.mp4", coverUrl: "/content/autostir-funny-cover.jpg", duration: 8, leagueId: "league1", productId: "p1", tags: '["funny","hands-free","cooking"]' },
    { id: "cp3", authorId: "user2", source: "user", type: "short", title: "This eraser is INSANE", mediaUrl: "/content/eraser-wow.mp4", coverUrl: "/content/eraser-wow-cover.jpg", duration: 15, leagueId: "league2", productId: "p8", tags: '["reaction","cleaning","wow"]' },
    { id: "cp4", authorId: "merchant3", source: "brand", type: "short", title: "InstaPeel - Potato in 10 seconds", mediaUrl: "/content/instapeel-demo.mp4", coverUrl: "/content/instapeel-demo-cover.jpg", duration: 10, leagueId: "league1", productId: "p5", brandId: "b3", tags: '["demo","speed","kitchen"]' },
    { id: "cp5", authorId: "user3", source: "user", type: "short", title: "Robot scrubs my tub while I nap", mediaUrl: "/content/robot-scrub-funny.mp4", coverUrl: "/content/robot-scrub-cover.jpg", duration: 14, leagueId: "league2", productId: "p12", tags: '["funny","lazy","bathroom"]' },
    { id: "cp6", authorId: "user1", source: "user", type: "short", title: "Worst kitchen fails vs QuickDrain", mediaUrl: "/content/quickdrain-fail.mp4", coverUrl: "/content/quickdrain-cover.jpg", duration: 11, leagueId: "league1", productId: "p3", tags: '["funny","fail","kitchen","comparison"]' },
    // Long videos
    { id: "cp7", authorId: "merchant6", source: "brand", type: "long", title: "ZenChop Complete Guide: 10 Features You Didn't Know", mediaUrl: "/content/zenchop-guide.mp4", coverUrl: "/content/zenchop-guide-cover.jpg", duration: 480, leagueId: "league1", productId: "p2", brandId: "b6", tags: '["tutorial","features","kitchen"]' },
    { id: "cp8", authorId: "user2", source: "user", type: "long", title: "I Tested 5 Cleaning Products for 30 Days - Honest Results", mediaUrl: "/content/cleaning-test.mp4", coverUrl: "/content/cleaning-test-cover.jpg", duration: 720, leagueId: "league2", tags: '["comparison","test","cleaning","honest-review"]' },
    { id: "cp9", authorId: "merchant2", source: "brand", type: "long", title: "EcoHome Steam Mop: From Unboxing to Spotless Floors", mediaUrl: "/content/steammop-unbox.mp4", coverUrl: "/content/steammop-cover.jpg", duration: 360, leagueId: "league2", productId: "p10", brandId: "b2", tags: '["unboxing","tutorial","cleaning"]' },
    { id: "cp10", authorId: "user3", source: "user", type: "long", title: "Small Kitchen Makeover: Best Gadgets Under $50", mediaUrl: "/content/kitchen-makeover.mp4", coverUrl: "/content/kitchen-makeover-cover.jpg", duration: 540, leagueId: "league1", tags: '["makeover","budget","kitchen","comparison"]' },
  ];

  for (const cp of contentPosts) {
    await prisma.contentPost.create({ data: cp });
  }

  // Content metrics
  const metricsData = [
    { contentPostId: "cp1", views: 15200, watchTime: 120000, completionRate: 0.89, likes: 1820, saves: 340, shares: 210 },
    { contentPostId: "cp2", views: 42300, watchTime: 280000, completionRate: 0.94, likes: 5100, saves: 890, shares: 1200 },
    { contentPostId: "cp3", views: 28700, watchTime: 350000, completionRate: 0.91, likes: 3400, saves: 560, shares: 780 },
    { contentPostId: "cp4", views: 8900, watchTime: 72000, completionRate: 0.85, likes: 920, saves: 180, shares: 95 },
    { contentPostId: "cp5", views: 31500, watchTime: 380000, completionRate: 0.88, likes: 4200, saves: 720, shares: 950 },
    { contentPostId: "cp6", views: 19800, watchTime: 180000, completionRate: 0.92, likes: 2300, saves: 410, shares: 320 },
    { contentPostId: "cp7", views: 6500, watchTime: 2100000, completionRate: 0.72, likes: 890, saves: 450, shares: 120 },
    { contentPostId: "cp8", views: 45000, watchTime: 24000000, completionRate: 0.68, likes: 5800, saves: 2100, shares: 1800 },
    { contentPostId: "cp9", views: 12300, watchTime: 3200000, completionRate: 0.75, likes: 1100, saves: 380, shares: 190 },
    { contentPostId: "cp10", views: 23400, watchTime: 9800000, completionRate: 0.71, likes: 3200, saves: 1500, shares: 890 },
  ];

  for (const m of metricsData) {
    await prisma.contentMetrics.create({ data: m });
  }

  // ===== VAR CASES =====
  const plsForVar = await prisma.productLeagueStatus.findFirst({ where: { productId: "p11", leagueId: "league2" } });
  if (plsForVar) {
    await prisma.varCase.create({
      data: {
        productLeagueStatusId: plsForVar.id,
        triggerReason: "high_return_rate",
        description: "Return rate reached 6%, above the 5% threshold for Div2 products.",
        status: "investigating",
      },
    });
  }

  // ===== CHALLENGES =====
  await prisma.challenge.create({
    data: {
      id: "ch1", leagueId: "league1", hashtag: "#5SecKitchenHack", title: "5-Second Kitchen Hack Challenge",
      description: "Show us your best kitchen hack that takes 5 seconds or less!",
      prizePool: 500, status: "active", startDate: new Date("2026-02-01"), endDate: new Date("2026-03-31"),
    },
  });
  await prisma.challenge.create({
    data: {
      id: "ch2", leagueId: "league2", hashtag: "#BathroomGlowUp", title: "Bathroom Glow-Up Challenge",
      description: "Transform your bathroom from grimy to gleaming. Before/after required!",
      prizePool: 750, status: "active", startDate: new Date("2026-02-15"), endDate: new Date("2026-04-15"),
    },
  });

  // Challenge entries
  await prisma.challengeEntry.create({
    data: { challengeId: "ch1", contentPostId: "cp2", userId: "user1", status: "featured" },
  });
  await prisma.challengeEntry.create({
    data: { challengeId: "ch2", contentPostId: "cp3", userId: "user2", status: "submitted" },
  });

  // ===== PK MATCHES =====
  await prisma.pkMatch.create({
    data: {
      id: "pk1", leagueId: "league1", seasonId: "s1", productAId: "p1", productBId: "p2",
      proofWinner: "p1", hypeWinner: "p2",
      statsSnapshot: JSON.stringify({
        productA: { rankScore: 88, hypeScore: 82, proofScore: 91, evidenceCount: 47 },
        productB: { rankScore: 85, hypeScore: 90, proofScore: 83, evidenceCount: 38 },
      }),
      status: "concluded",
    },
  });
  await prisma.pkMatch.create({
    data: {
      id: "pk2", leagueId: "league2", seasonId: "s2", productAId: "p7", productBId: "p8",
      statsSnapshot: JSON.stringify({
        productA: { rankScore: 91, hypeScore: 85, proofScore: 94, evidenceCount: 62 },
        productB: { rankScore: 87, hypeScore: 88, proofScore: 87, evidenceCount: 45 },
      }),
      status: "active",
    },
  });

  // ===== CREDITS =====
  await prisma.creditsLedger.create({
    data: { userId: "user1", orderId: "order2", amount: 0.75, type: "div_reward", description: "Div2 exploration reward (3%): QuickDrain Colander", balance: 0.75 },
  });
  await prisma.creditsLedger.create({
    data: { userId: "user3", orderId: "order6", amount: 1.15, type: "div_reward", description: "Div2 exploration reward (3%): FreshAir Odor Eliminator (pending delivery)", balance: 1.15 },
  });

  // ===== BADGES =====
  await prisma.userBadge.create({ data: { userId: "user1", badge: "evidence_hunter" } });
  await prisma.userBadge.create({ data: { userId: "user2", badge: "landmine_terminator" } });
  await prisma.userBadge.create({ data: { userId: "user3", badge: "compare_maniac" } });

  // ===== DEPOSITS =====
  for (const mId of ["m1", "m2", "m3", "m4", "m5", "m6"]) {
    await prisma.deposit.create({
      data: { merchantId: mId, amount: 1000, type: "initial", reason: "Initial deposit", balance: 1000 },
    });
  }

  // ===== CUSTOM PRODUCT PAGES =====
  await prisma.customProductPage.create({
    data: {
      productId: "p1", merchantId: "m3", theme: "brand",
      layout: JSON.stringify({
        sections: [
          { type: "hero", config: { headline: "Never Stir Again", subtext: "AutoStir Pro does it for you", bgColor: "#1a1a2e" } },
          { type: "video_demo", config: { title: "See it in action" } },
          { type: "features_grid", config: { columns: 3 } },
          { type: "testimonials", config: { limit: 6 } },
          { type: "comparison_table", config: {} },
          { type: "faq", config: {} },
        ],
      }),
      isPublished: true, claimTier: "L2", reviewStatus: "approved",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
