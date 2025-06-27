const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to create a URL-friendly slug
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Create a blog post with multiple sections
 * @param {Object} blogData - The blog data
 * @param {Array} sections - Array of section objects with image and text
 */
 async function createBlogWithSections(blogData, sections) {
  try {
    const slug = blogData.slug || createSlug(blogData.title);

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      console.log(`⚠️ Blog already exists: ${slug}`);
      return;
    }

    const blog = await prisma.blog.create({
      data: {
        title: blogData.title,
        slug,
        excerpt: blogData.excerpt,
        coverImage: blogData.coverImage,
        published: blogData.published ?? false,
        author: blogData.author || 'Ohalik Tours Team',
        sections: {
          create: sections.map((section, index) => ({
            image: section.image || null,
            text: section.text,
            order: index
          }))
        }
      },
      include: { sections: true }
    });

    console.log(`✅ Blog created: ${blog.title}`);
    return blog;
  } catch (error) {
    console.error('❌ Error creating blog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Sample blog data
async function createSampleBlogs() {
  await createBlogWithSections(
    {
      title: "Mountain Trek Adventure",
      excerpt: "Join us on an unforgettable journey through the majestic mountains of Ohalik.",
      coverImage: "/assets/photo_2025-03-09_20-33-58.jpg",
      published: true
    },
    [
      {
        image: "/assets/photo_2025-03-09_20-33-58.jpg",
        text: "Our journey began at dawn..."
      },
      {
        text: "The first two hours of hiking took us through ancient woodlands..."
      },
      {
        image: "/assets/photo_2025-03-09_20-33-58.jpg",
        text: "By midday, we had ascended above the treeline..."
      },
      {
        text: "Lunch was a simple but satisfying affair..."
      },
      {
        image: "/assets/photo_2025-03-11_14-20-10.jpg",
        text: "The final push to the summit tested our endurance..."
      }
    ]
  );

   await createBlogWithSections(
    {
      title: "Coastal Adventure: Exploring Hidden Beaches",
      excerpt: "Discover the secret coves and pristine beaches along Ohalik's stunning coastline.",
      coverImage: "/Assets/photo_2025-03-09_20-33-58.jpg",
      published: true
    },
    [
      {
        image: "/Assets/photo_2025-03-09_20-33-58.jpg",
        text: "The coastal adventure began with a boat ride from Ohalik Harbor at sunrise. As we pushed off from the dock, the golden light of dawn illuminated the water, creating a magical atmosphere for the journey ahead."
      },
      {
        text: "Our experienced captain navigated through hidden passages between towering cliffs, revealing secluded beaches that few tourists ever discover. Each cove seemed more beautiful than the last, with fine white sand and crystal-clear waters."
      },
      {
        image: "/Assets/photo_2025-03-1_14-20-10.jpg",
        text: "We anchored at a pristine beach accessible only by boat. The shallow waters revealed colorful fish darting between coral formations, making it a perfect spot for snorkeling and underwater photography."
      },
      {
        text: "After a freshly prepared seafood lunch on the beach, we hiked up a coastal trail to a spectacular viewpoint. The panorama of the coastline stretching into the distance, with its dramatic cliffs and hidden beaches, left everyone speechless."
      },
      {
        image: "/Assets/photo_2025-03-09_20-33-58.jpg",
        text: "As the day drew to a close, we watched the sunset from the boat on our return journey. The sky exploded with color, reflecting off the calm waters and creating a perfect end to our coastal adventure."
      }
    ]
  );

  await createBlogWithSections(
    {
      title: "Desert Nomad Experience",
      excerpt: "Traverse the vast deserts of Uzbekistan and experience the nomadic way of life.",
      coverImage: "/assets/photo_2025-03-12_08-45-21.jpg",
      published: true
    },
    [
      {
        image: "/assets/photo_2025-03-12_08-45-21.jpg",
        text: "The desert wind greeted us as we mounted our camels and began our trek across the golden dunes. The silence of the vast expanse was both eerie and serene, broken only by the soft crunch of sand beneath our mounts."
      },
      {
        text: "Midway through the journey, we stopped at a yurt camp nestled in a shallow valley. The warmth of nomadic hospitality was immediate—offering us sweet tea and tales from generations past."
      },
      {
        image: "/assets/photo_2025-03-12_09-10-45.jpg",
        text: "As night fell, we gathered around a fire under a blanket of stars. Traditional music echoed into the night while locals danced, and we felt deeply connected to the rhythm of desert life."
      },
      {
        text: "Sleeping in the yurt, cocooned in heavy blankets, the stillness was complete. It was as if time had paused, letting us fully absorb the desert’s quiet majesty."
      },
      {
        image: "/assets/photo_2025-03-12_06-30-00.jpg",
        text: "With the rising sun casting long shadows on the dunes, we resumed our journey, hearts full and spirits uplifted by the wisdom of the sands."
      }
    ]
  );

  
  await createBlogWithSections(
    {
      title: "Silk Road Caravan Journey",
      excerpt: "Follow the footsteps of ancient traders on a Silk Road journey filled with culture and discovery.",
      coverImage: "/assets/photo_2025-03-13_10-15-00.jpg",
      published: true
    },
    [
      {
        image: "/assets/photo_2025-03-13_10-15-00.jpg",
        text: "Our journey began in the bustling market streets of Samarkand, where spices, silks, and smiles traded hands just as they had centuries ago."
      },
      {
        text: "Traveling eastward, we passed caravanserais—once resting places for weary merchants. Their ruins told stories of distant lands, camel bells, and the promise of trade."
      },
      {
        image: "/assets/photo_2025-03-13_11-50-22.jpg",
        text: "In Bukhara, we were captivated by ancient architecture: turquoise domes, intricate tilework, and the call of minarets that pierced the skies."
      },
      {
        text: "Our guide shared legends of merchants and monks, and we tried our hand at crafting traditional pottery in a village that seemed untouched by time."
      },
      {
        image: "/assets/photo_2025-03-13_13-25-10.jpg",
        text: "The final leg of our caravan trail led us to Khiva, where city walls glowed orange under the setting sun. It felt like walking into a living museum of the Silk Road."
      }
    ]
  );

  
  await createBlogWithSections(
    {
      title: "Winter Wonderland in the Highlands",
      excerpt: "Escape to the snowy highlands of Ohalik for a magical winter experience like no other.",
      coverImage: "/assets/photo_2025-03-14_07-20-30.jpg",
      published: true
    },
    [
      {
        image: "/assets/photo_2025-03-14_07-20-30.jpg",
        text: "Snow blanketed the world as we ascended into the highlands. Pines bowed under the weight of frost, and our breath formed clouds in the crisp morning air."
      },
      {
        text: "Our lodge, built from timber and stone, offered warm refuge. Inside, a roaring fire and hot mulled tea revived us after the icy trek."
      },
      {
        image: "/assets/photo_2025-03-14_08-05-15.jpg",
        text: "Afternoon snowshoe hikes revealed frozen waterfalls, deer tracks, and views that stretched across the white wilderness like a painting."
      },
      {
        text: "Evenings were for storytelling and steaming bowls of stew. The hush of snowfall outside made everything feel safe and sacred."
      },
      {
        image: "/assets/photo_2025-03-14_09-40-40.jpg",
        text: "As we left the highlands, we carried with us a deep peace—the kind that only a winter silence and snowy solitude can offer."
      }
    ]
  );

  console.log("🎉 Sample blogs created successfully!");
}

// Run the function if this script is executed directly
if (require.main === module) {
  createSampleBlogs()
    .then(() => console.log("✅ Done creating all sample blogs!"))
    .catch(error => console.error("❌ Error in createSampleBlogs():", error));
}

module.exports = { createBlogWithSections, createSlug };
