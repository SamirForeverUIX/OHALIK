const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // First tour - Silk Road
  const silkRoadTour = await prisma.tour.create({
    data: {
      name: 'Silk Road Samarkand Tour',
      description: 'Discover the ancient Silk Road treasures of Samarkand, one of the oldest continuously inhabited cities in Central Asia. Explore magnificent architecture, vibrant bazaars, and immerse yourself in the rich history of this UNESCO World Heritage site. Our expert local guides will take you through the footsteps of ancient traders, conquerors, and scholars.',
      duration: 7,
      price: 1599,
      location: 'Samarkand, Uzbekistan',
      difficulty: 'Easy',
      maxGroup: 10,
      featured: true,
      imageUrl: '/images/tours/samarkand.jpg',
      itinerary: {
        create: [
          {
            dayNumber: 1,
            title: 'Arrival in Samarkand',
            description: 'Welcome to the legendary city of Samarkand! Upon arrival at the airport, our representative will meet you and transfer you to your hotel. After check-in and some rest, join us for a welcome dinner at a local restaurant featuring traditional Uzbek cuisine.',
            activities: 'Airport transfer, welcome dinner',
            meals: 'Dinner',
            accommodation: 'Hotel Registan',
          },
          {
            dayNumber: 2,
            title: 'Registan Square & Bibi-Khanym Mosque',
            description: 'Today we explore the heart of ancient Samarkand. Begin with the iconic Registan Square surrounded by three stunning madrasahs: Ulugh Beg, Sher-Dor, and Tilya-Kori. After lunch, visit the magnificent Bibi-Khanym Mosque, built by Timur for his favorite wife.',
            activities: 'Guided tours of Registan Square and Bibi-Khanym Mosque',
            meals: 'Breakfast, Lunch',
            accommodation: 'Hotel Registan',
          },
          {
            dayNumber: 3,
            title: 'Shah-i-Zinda & Ulugh Beg Observatory',
            description: 'Visit the breathtaking Shah-i-Zinda necropolis, a stunning ensemble of mausoleums with some of the richest tile work in the Islamic world. In the afternoon, explore Ulugh Beg Observatory, where groundbreaking astronomical work was conducted in the 15th century.',
            activities: 'Guided tours of Shah-i-Zinda and Ulugh Beg Observatory',
            meals: 'Breakfast, Lunch',
            accommodation: 'Hotel Registan',
          }
        ],
      },
    },
  });

  // Second tour - Mountain Trek
  const mountainTour = await prisma.tour.create({
    data: {
      name: 'Ohalik Mountain Adventure',
      description: 'Experience the majestic mountains surrounding Ohalik Village on this 5-day trekking adventure. Climb to breathtaking viewpoints, camp beside pristine alpine lakes, and immerse yourself in the natural beauty of this unspoiled landscape. Our young, passionate local guides will share their intimate knowledge of the mountains they grew up exploring.',
      duration: 5,
      price: 899,
      location: 'Ohalik Mountains',
      difficulty: 'Moderate',
      maxGroup: 8,
      featured: true,
      imageUrl: '/images/tours/mountains.jpg',
      itinerary: {
        create: [
          {
            dayNumber: 1,
            title: 'Arrival and Orientation',
            description: 'Meet in Ohalik Village for orientation and equipment check. After lunch, enjoy a short warm-up hike to a nearby viewpoint to see the route ahead. Evening includes dinner and detailed briefing about the journey.',
            activities: 'Village tour, warm-up hike, equipment check',
            meals: 'Lunch, Dinner',
            accommodation: 'Local Guesthouse',
          },
          {
            dayNumber: 2,
            title: 'Trek to Eagle Valley',
            description: 'Begin your trek through pine forests to Eagle Valley. Climb gradually to 2,300m with spectacular views of surrounding peaks. Set up camp near a mountain stream, perfect for a refreshing dip.',
            activities: '6-hour trek, wildlife spotting',
            meals: 'Breakfast, Lunch, Dinner',
            accommodation: 'Camping',
          },
        ],
      },
    },
  });

  // Third tour - Cultural Experience
  const culturalTour = await prisma.tour.create({
    data: {
      name: 'Traditional Crafts & Cuisine',
      description: 'Immerse yourself in the authentic cultural traditions of Ohalik Village. Learn traditional crafts from local artisans, cook regional specialties with village families, and participate in seasonal celebrations. This hands-on experience offers genuine cultural exchange rarely found in typical tourist destinations.',
      duration: 3,
      price: 599,
      location: 'Ohalik Village',
      difficulty: 'Easy',
      maxGroup: 6,
      featured: false,
      imageUrl: '/images/tours/cultural.jpg',
      itinerary: {
        create: [
          {
            dayNumber: 1,
            title: 'Village Welcome',
            description: 'Arrive at Ohalik Village where you\'ll be welcomed with traditional bread and tea ceremony. Meet your host family and settle into your homestay. Afternoon includes a village walk and introduction to local culture followed by a shared dinner.',
            activities: 'Welcome ceremony, village walk',
            meals: 'Lunch, Dinner',
            accommodation: 'Family Homestay',
          },
          {
            dayNumber: 2,
            title: 'Craft Workshop Day',
            description: 'Spend the morning learning traditional wool craft from village artisans. After lunch, join a pottery workshop with the village master. Evening features traditional music around the fire.',
            activities: 'Wool craft workshop, pottery class',
            meals: 'Breakfast, Lunch, Dinner',
            accommodation: 'Family Homestay',
          },
        ],
      },
    },
  });

  console.log('Tours created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding tours:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });