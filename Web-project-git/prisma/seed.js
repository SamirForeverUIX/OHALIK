const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seed() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@ohaliktours.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    },
  });

  // Create blog posts
  await prisma.blog.create({
    data: {
      title: 'Welcome to Ohalik Tours',
      content: 'Welcome to our official blog! Here we will share stories from our adventures, tips for travelers, and updates about our tours. Stay tuned for exciting content!',
      coverImage: '/Assets/photo_2025-03-09_20-33-58.jpg',
      isPublished: true,
    },
  });

  await prisma.blog.create({
    data: {
      title: 'The Hidden Gems of Ohalik Village',
      content: 'Discover the secret spots that only locals know about. From hidden waterfalls to breathtaking viewpoints, we reveal our favorite places off the beaten path in Ohalik Village.',
      coverImage: '/Assets/photo_2025-03-09_20-33-58.jpg',
      isPublished: true,
    },
  });

  // Create tours
  await prisma.tour.create({
    data: {
      name: 'Mountain Village Walks',
      description: 'Experience the breathtaking beauty of Ohalik\'s mountains on this 5-day adventure. Trek through untouched valleys, camp beside crystal-clear mountain lakes, and immerse yourself in the rich culture of our village.',
      duration: 5,
      price: 599,
      location: 'Ohalik Village',
      difficulty: 'Moderate',
      maxGroup: 8,
      featured: true,
      imageUrl: '/Assets/2924481114_ee3c15a7f0_o.webp',
      itinerary: {
        create: [
          {
            dayNumber: 1,
            title: 'Welcome to Ohalik Village',
            description: 'Arrive in Ohalik Village where our team will greet you. After settling into your guesthouse, enjoy a welcome dinner with local specialties prepared by village families.',
            activities: 'Village tour, welcome dinner, bonfire',
            meals: 'Dinner',
            accommodation: 'Traditional Village Guesthouse'
          },
          {
            dayNumber: 2,
            title: 'Valley Trek & Ancient Petroglyphs',
            description: 'After breakfast, we begin our trek through the valley, passing through pine forests and meadows filled with wildflowers.',
            activities: 'Hiking, viewing petroglyphs, picnic lunch',
            meals: 'Breakfast, Lunch, Dinner',
            accommodation: 'Camping'
          }
        ]
      }
    }
  });

  console.log('Seeding complete!');
}

seed()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });