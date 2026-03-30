import { PrismaService } from './package/prisma/prisma.service';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaService();

const rewardsData = [
  {
    name: 'Company Hoodie',
    description:
      'Premium heavyweight cotton hoodie with embroidered minimalist logo. Available in all sizes.',
    point_cost: 10,
    stock: 50,
    image_url:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: '$50 Amazon Gift Card',
    description:
      'Digital gift card delivered instantly to your inbox. Use it for anything.',
    point_cost: 50,
    stock: 100,
    image_url:
      'https://images.unsplash.com/photo-1680882991288-a35e4d86d8ee?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'One Day Off',
    description:
      'Take a fully paid personal day to recharge. Requires manager approval.',
    point_cost: 150,
    stock: 70,
    image_url:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Coffee with the CEO',
    description:
      '30-minute informal chat over coffee to share ideas and get mentorship.',
    point_cost: 60,
    stock: 5,
    image_url:
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Noise Cancelling Headphones',
    description:
      'Top-tier wireless noise-cancelling headphones for deep work focus.',
    point_cost: 200,
    stock: 3,
    image_url:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Standing Desk Converter',
    description:
      'Ergonomic standing desk converter to improve your home office setup.',
    point_cost: 1500,
    stock: 8,
    image_url:
      'https://images.unsplash.com/photo-1605543123001-e33188b556c9?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: '$100 Uber Eats Credit',
    description: 'Treat yourself and your family to a nice dinner on us.',
    point_cost: 1200,
    stock: 100,
    image_url:
      'https://images.unsplash.com/photo-1764745222236-42ba3e0733b9?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Company Backpack',
    description:
      'Durable, water-resistant laptop backpack with plenty of organization.',
    point_cost: 80,
    stock: 90,
    image_url:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
  },
];

async function main() {
  console.log('Seeding rewards...');

  for (const reward of rewardsData) {
    const existing = await prisma.reward.findFirst({
      where: { name: reward.name },
    });

    if (!existing) {
      await prisma.reward.create({
        data: reward,
      });
      console.log(`Created reward: ${reward.name}`);
    } else {
      await prisma.reward.update({
        where: { id: existing.id },
        data: reward,
      });
      console.log(`Updated reward: ${reward.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
