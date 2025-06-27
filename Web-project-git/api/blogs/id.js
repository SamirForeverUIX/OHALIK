// /api/blogs/id.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const path = require('path');


  try {
    // Convert the id to a string instead of parsing it to an integer
    const blog = await prisma.blog.findUnique({
      where: { id: String(id) },  // Convert the ID to a string
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.status(200).json(blog);  // Send the blog data as a JSON response
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Error fetching blog data' });
  } finally {
    await prisma.$disconnect();  // Disconnect Prisma client
  }
});

module.exports = router;
