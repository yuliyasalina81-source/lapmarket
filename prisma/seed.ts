import {
  PrismaClient,
  AnimalBadge,
  AnimalKind,
  ProductCategory,
  ProductStatus,
  ListingStatus,
  ServiceKind,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_IMAGE_URLS } from "../src/lib/constants";

const prisma = new PrismaClient();

const DEV_PASSWORD = "lapmarket123";

async function createDemoMedia(
  userId: string,
  url: string,
  pathname: string
) {
  return prisma.mediaAsset.create({
    data: {
      userId,
      url,
      pathname,
      mimeType: "image/jpeg",
      size: 100000,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  const maria = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: { passwordHash },
    create: {
      email: "maria@example.com",
      name: "Мария К.",
      displayName: "Мария К.",
      avatar: "🐾",
      city: "Москва",
      role: "OWNER",
      passwordHash,
      pets: {
        create: [
          { name: "Боня", kind: AnimalKind.DOG, breed: "Лабрадор" },
          { name: "Марс", kind: AnimalKind.CAT },
        ],
      },
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: {
      email: "seller@example.com",
      name: "ЗооМир",
      displayName: "ЗооМир",
      avatar: "🏪",
      city: "Москва",
      role: "SELLER",
      passwordHash,
      sellerProfile: {
        create: {
          shopName: "ЗооМир — официальный дилер",
          description: "Сертифицированный продавец кормов и аксессуаров",
          tier: "CERTIFIED",
          verifiedAt: new Date("2024-06-12"),
        },
      },
    },
  });

  const shelter = await prisma.user.upsert({
    where: { email: "shelter@example.com" },
    update: {},
    create: {
      email: "shelter@example.com",
      name: "Приют Лапки",
      displayName: "Приют Лапки",
      avatar: "♥",
      role: "SHELTER",
      passwordHash,
      shelterProfile: {
        create: {
          organizationName: "Приют «Лапки»",
          description: "Помогаем найти дом бездомным животным",
          city: "Санкт-Петербург",
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@lapmarket.local" },
    update: {},
    create: {
      email: "admin@lapmarket.local",
      name: "Администратор",
      displayName: "Администратор",
      avatar: "🛡️",
      role: "ADMIN",
      passwordHash,
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "seller2@example.com" },
    update: {},
    create: {
      email: "seller2@example.com",
      name: "Лапки & Хвосты",
      displayName: "Лапки & Хвосты",
      avatar: "🐱",
      city: "Москва",
      role: "SELLER",
      passwordHash,
      sellerProfile: {
        create: {
          shopName: "Лапки & Хвосты",
          description: "Премиум-аксессуары для кошек и собак",
          tier: "CERTIFIED",
          verifiedAt: new Date("2025-01-08"),
        },
      },
    },
  });

  const pendingSeller = await prisma.user.upsert({
    where: { email: "pending@example.com" },
    update: {},
    create: {
      email: "pending@example.com",
      name: "Новый магазин",
      displayName: "Новый магазин",
      avatar: "🏪",
      city: "Казань",
      role: "SELLER",
      passwordHash,
      sellerProfile: {
        create: {
          shopName: "ЗооНовичок",
          description: "Новый продавец, ожидает сертификации",
          tier: "PENDING",
        },
      },
    },
  });

  const pendingProfile = await prisma.sellerProfile.findUnique({
    where: { userId: pendingSeller.id },
  });
  if (pendingProfile) {
    const existingCert = await prisma.sellerCertificationRequest.findFirst({
      where: { sellerProfileId: pendingProfile.id, status: "PENDING" },
    });
    if (!existingCert) {
      await prisma.sellerCertificationRequest.create({
        data: {
          sellerProfileId: pendingProfile.id,
          status: "PENDING",
          note: "Прошу сертификацию для продажи кормов",
        },
      });
    }
  }

  // Demo media for products
  const foodImg = await createDemoMedia(
    seller.id,
    DEMO_IMAGE_URLS.food,
    "seed/food.jpg"
  );
  const toyImg = await createDemoMedia(
    seller2.id,
    DEMO_IMAGE_URLS.toy,
    "seed/toy.jpg"
  );
  const bedImg = await createDemoMedia(
    seller2.id,
    DEMO_IMAGE_URLS.bed,
    "seed/bed.jpg"
  );

  const products = [
    {
      title: "Корм сухой премиум, 12 кг",
      description: "Премиальный сухой корм для взрослых собак средних пород.",
      price: 4890,
      category: ProductCategory.FOOD,
      sellerId: seller.id,
      mediaId: foodImg.id,
      rating: 4.8,
    },
    {
      title: "Влажный корм для котят, 24×85 г",
      description: "Сбалансированное питание для котят до 12 месяцев.",
      price: 2190,
      category: ProductCategory.FOOD,
      sellerId: seller.id,
      mediaId: foodImg.id,
      rating: 4.6,
    },
    {
      title: "Интерактивная игрушка-мышка",
      description: "Игрушка с перьями и звуком для кошек.",
      price: 890,
      category: ProductCategory.TOYS,
      sellerId: seller2.id,
      mediaId: toyImg.id,
      rating: 4.9,
    },
    {
      title: "Мяч с пищалкой, набор 3 шт.",
      description: "Набор мячей для активных игр с собакой.",
      price: 590,
      category: ProductCategory.TOYS,
      sellerId: seller2.id,
      mediaId: toyImg.id,
      rating: 4.7,
    },
    {
      title: "Лежанка ортопедическая L",
      description: "Ортопедическая лежанка с памятью формы.",
      price: 5490,
      category: ProductCategory.BEDS,
      sellerId: seller2.id,
      mediaId: bedImg.id,
      rating: 4.8,
    },
    {
      title: "Домик-когтеточка «Баобаб»",
      description: "Многоуровневый комплекс для кошек.",
      price: 3490,
      category: ProductCategory.BEDS,
      sellerId: seller2.id,
      mediaId: bedImg.id,
      rating: 4.9,
    },
    {
      title: "Витамины для суставов, 60 таб.",
      description: "Поддержка суставов для собак старше 5 лет.",
      price: 1290,
      category: ProductCategory.PHARMACY,
      sellerId: seller.id,
      mediaId: foodImg.id,
      rating: 4.5,
    },
    {
      title: "Капли от блох и клещей",
      description: "Защита от паразитов на 30 дней.",
      price: 890,
      category: ProductCategory.PHARMACY,
      sellerId: seller.id,
      mediaId: foodImg.id,
      rating: 4.7,
    },
  ];

  for (const p of products) {
    const { mediaId, ...rest } = p;
    const product = await prisma.product.create({
      data: { ...rest, status: ProductStatus.PUBLISHED },
    });
    await prisma.productImage.create({
      data: { productId: product.id, mediaId, sortOrder: 0 },
    });
  }

  // Animal listings
  const dogImg = await createDemoMedia(
    seller.id,
    DEMO_IMAGE_URLS.dog,
    "seed/dog.jpg"
  );
  const catImg = await createDemoMedia(
    shelter.id,
    DEMO_IMAGE_URLS.cat,
    "seed/cat.jpg"
  );

  const listings = [
    {
      authorId: seller.id,
      name: "Арчи",
      kind: AnimalKind.DOG,
      breed: "Золотистый ретривер",
      age: "3 месяца",
      city: "Москва",
      price: 85000,
      badges: [AnimalBadge.PEDIGREE],
      description: "Щенок с родословной РКФ, привит, микрочип",
      status: ListingStatus.PUBLISHED,
      mediaId: dogImg.id,
    },
    {
      authorId: seller.id,
      name: "Муся",
      kind: AnimalKind.CAT,
      breed: "Британская короткошёрстная",
      age: "2 месяца",
      city: "Санкт-Петербург",
      price: 42000,
      badges: [AnimalBadge.PEDIGREE],
      description: "Котёнок с паспортом FIFe, привит",
      status: ListingStatus.PUBLISHED,
      mediaId: catImg.id,
    },
    {
      authorId: shelter.id,
      name: "Барсик",
      kind: AnimalKind.CAT,
      age: "1 год",
      city: "Казань",
      badges: [AnimalBadge.GOOD_HANDS],
      description: "Дружелюбный кот из приюта, ищет любящую семью",
      status: ListingStatus.PUBLISHED,
      mediaId: catImg.id,
    },
    {
      authorId: shelter.id,
      name: "Шарик",
      kind: AnimalKind.DOG,
      age: "5 лет",
      city: "Новосибирск",
      badges: [AnimalBadge.GOOD_HANDS],
      description: "Спокойный пёс, хорошо ладит с детьми",
      status: ListingStatus.PUBLISHED,
      mediaId: dogImg.id,
    },
    {
      authorId: seller.id,
      name: "Лаки",
      kind: AnimalKind.DOG,
      breed: "Корги",
      age: "4 месяца",
      city: "Москва",
      price: 95000,
      badges: [AnimalBadge.PEDIGREE],
      description: "Щенок с документами, социализирован",
      status: ListingStatus.PENDING,
      mediaId: dogImg.id,
    },
  ];

  for (const l of listings) {
    const { mediaId, ...rest } = l;
    const listing = await prisma.animalListing.create({ data: rest });
    await prisma.animalListingImage.create({
      data: { listingId: listing.id, mediaId, sortOrder: 0 },
    });
  }

  // Services
  const vetImg = await createDemoMedia(
    admin.id,
    DEMO_IMAGE_URLS.vet,
    "seed/vet.jpg"
  );
  const groomImg = await createDemoMedia(
    admin.id,
    DEMO_IMAGE_URLS.groom,
    "seed/groom.jpg"
  );

  await prisma.serviceProvider.createMany({
    data: [
      {
        userId: admin.id,
        name: "Клиника «ВетЛайф»",
        kind: ServiceKind.VETERINARY,
        city: "Москва",
        address: "ул. Профсоюзная, 12",
        rating: 4.9,
        reviewCount: 312,
        priceFrom: 1200,
        specialties: ["Терапия", "Хирургия", "Стоматология"],
        verified: true,
        mediaId: vetImg.id,
      },
      {
        userId: admin.id,
        name: "Груминг «Пушистик»",
        kind: ServiceKind.GROOMING,
        city: "Москва",
        address: "пр-т Мира, 45, стр. 2",
        rating: 4.8,
        reviewCount: 156,
        priceFrom: 2500,
        specialties: ["Стрижка", "Тримминг", "SPA-уход"],
        verified: true,
        mediaId: groomImg.id,
      },
      {
        userId: admin.id,
        name: "Салон «Гладкая шерсть»",
        kind: ServiceKind.GROOMING,
        city: "Санкт-Петербург",
        address: "Невский пр., 88",
        rating: 4.6,
        reviewCount: 94,
        priceFrom: 1800,
        specialties: ["Кошки", "Собаки мелких пород"],
        verified: true,
        mediaId: groomImg.id,
      },
      {
        userId: admin.id,
        name: "Ветцентр «Здоровый хвост»",
        kind: ServiceKind.VETERINARY,
        city: "Казань",
        address: "ул. Баумана, 3",
        rating: 4.7,
        reviewCount: 201,
        priceFrom: 900,
        specialties: ["УЗИ", "Вакцинация", "Стационар"],
        verified: true,
        mediaId: vetImg.id,
      },
    ],
  });

  // Feed posts
  const postImg1 = await createDemoMedia(
    maria.id,
    DEMO_IMAGE_URLS.post1,
    "seed/post1.jpg"
  );
  const postImg2 = await createDemoMedia(
    maria.id,
    DEMO_IMAGE_URLS.post2,
    "seed/post2.jpg"
  );

  const mariaPets = await prisma.pet.findMany({ where: { userId: maria.id } });
  const bonya = mariaPets.find((p) => p.name === "Боня");
  const mars = mariaPets.find((p) => p.name === "Марс");

  if (bonya) {
    await prisma.vaccination.create({
      data: {
        petId: bonya.id,
        name: "Бешенство",
        date: new Date("2025-11-10"),
        nextDueAt: new Date("2026-11-10"),
        clinic: "ВетЛайф",
      },
    });
    await prisma.reminder.create({
      data: {
        petId: bonya.id,
        type: "VACCINATION",
        title: "Повторная прививка от бешенства",
        dueAt: new Date("2026-11-01"),
      },
    });
    await prisma.weightLog.create({
      data: { petId: bonya.id, kg: 28.5 },
    });
    await prisma.pet.update({
      where: { id: bonya.id },
      data: { weightKg: 28.5, birthDate: new Date("2023-04-15") },
    });
  }

  const post1 = await prisma.post.create({
    data: {
      authorId: maria.id,
      content:
        "Наконец-то нашли идеальный корм на ЛапМаркет — только у сертифицированных продавцов, спокойно за качество! 🐕",
      petId: bonya?.id,
      petName: "Боня",
      tags: ["корм", "собака"],
      mediaId: postImg1.id,
      createdAt: new Date("2026-05-20T14:30:00"),
    },
  });

  await prisma.post.create({
    data: {
      authorId: seller.id,
      content:
        "Записались к грумеру через ЛапМаркет — удобно видеть отзывы и бейдж «Лицензия проверена».",
      petName: "Марс",
      tags: ["груминг", "кот"],
      createdAt: new Date("2026-05-19T09:15:00"),
    },
  });

  await prisma.post.create({
    data: {
      authorId: shelter.id,
      content:
        "Барсик ищет дом! Отметка «в добрые руки» — бесплатно в любящую семью. ❤️",
      petName: "Барсик",
      tags: ["приют", "усыновление"],
      mediaId: postImg2.id,
      createdAt: new Date("2026-05-18T18:00:00"),
    },
  });

  await prisma.post.create({
    data: {
      authorId: maria.id,
      content:
        "Новая лежанка — пушистый рай! Рекомендую раздел «Товары» с галочкой сертификации.",
      petId: mars?.id,
      petName: mars?.name ?? "Марс",
      tags: ["лежанка", "кот"],
      mediaId: postImg1.id,
      createdAt: new Date("2026-05-17T11:00:00"),
    },
  });

  // Sample likes and comments
  await prisma.postLike.create({
    data: { postId: post1.id, userId: seller.id },
  });
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: shelter.id,
      content: "Рады, что вам понравилось! 🐾",
    },
  });

  console.log("Seed completed. Dev password for all users:", DEV_PASSWORD);
  console.log("  maria@example.com (owner)");
  console.log("  seller@example.com (certified seller)");
  console.log("  seller2@example.com (certified seller)");
  console.log("  shelter@example.com (shelter)");
  console.log("  pending@example.com (pending seller)");
  console.log("  admin@lapmarket.local (admin)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
