const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@caltrail.com' },
    update: {},
    create: {
      email: 'admin@caltrail.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Created admin user:', admin.email)

  // Create nutritionist
  const nutritionistPassword = await bcrypt.hash('nutritionist123', 12)
  const nutritionist = await prisma.user.upsert({
    where: { email: 'nutritionist@caltrail.com' },
    update: {},
    create: {
      email: 'nutritionist@caltrail.com',
      name: 'Dr. Sarah Johnson',
      password: nutritionistPassword,
      role: 'NUTRITIONIST'
    }
  })
  console.log('✅ Created nutritionist:', nutritionist.email)

  // Create demo users
  const userPassword = await bcrypt.hash('user123', 12)
  const users = []
  
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@caltrail.com` },
      update: {},
      create: {
        email: `user${i}@caltrail.com`,
        name: `Demo User ${i}`,
        password: userPassword,
        role: 'USER',
        height: 160 + Math.random() * 40, // 160-200 cm
        weight: 50 + Math.random() * 50,  // 50-100 kg
        gender: i % 2 === 0 ? 'female' : 'male',
        activityLevel: ['sedentary', 'lightly_active', 'moderately_active'][i % 3],
        goals: ['maintain', 'lose', 'gain'][i % 3],
        assignedNutritionistId: nutritionist.id
      }
    })
    users.push(user)
  }
  console.log('✅ Created demo users')

  // Seed basic food items
  const foods = [
    {
      name: 'Chicken Breast (Cooked)',
      description: 'Skinless, boneless chicken breast, grilled',
      calories: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      fiber: 0,
      source: 'CUSTOM'
    },
    {
      name: 'Brown Rice (Cooked)',
      description: 'Long grain brown rice, cooked',
      calories: 112,
      protein: 2.6,
      fat: 0.9,
      carbs: 23,
      fiber: 1.8,
      source: 'CUSTOM'
    },
    {
      name: 'Broccoli (Steamed)',
      description: 'Fresh broccoli, steamed',
      calories: 35,
      protein: 2.8,
      fat: 0.4,
      carbs: 7,
      fiber: 2.6,
      source: 'CUSTOM'
    },
    {
      name: 'Salmon (Atlantic, Cooked)',
      description: 'Atlantic salmon, baked or grilled',
      calories: 206,
      protein: 22,
      fat: 12,
      carbs: 0,
      fiber: 0,
      source: 'CUSTOM'
    },
    {
      name: 'Sweet Potato (Baked)',
      description: 'Baked sweet potato with skin',
      calories: 103,
      protein: 2.3,
      fat: 0.1,
      carbs: 24,
      fiber: 3.9,
      source: 'CUSTOM'
    },
    {
      name: 'Greek Yogurt (Plain)',
      description: 'Non-fat Greek yogurt, plain',
      calories: 59,
      protein: 10,
      fat: 0.4,
      carbs: 3.6,
      fiber: 0,
      source: 'CUSTOM'
    },
    {
      name: 'Avocado',
      description: 'Fresh avocado',
      calories: 160,
      protein: 2,
      fat: 15,
      carbs: 9,
      fiber: 7,
      source: 'CUSTOM'
    },
    {
      name: 'Almonds (Raw)',
      description: 'Raw almonds, unsalted',
      calories: 579,
      protein: 21,
      fat: 50,
      carbs: 22,
      fiber: 12,
      source: 'CUSTOM'
    },
    {
      name: 'Banana (Medium)',
      description: 'Fresh banana, medium size',
      calories: 105,
      protein: 1.3,
      fat: 0.4,
      carbs: 27,
      fiber: 3.1,
      source: 'CUSTOM'
    },
    {
      name: 'Egg (Large, Cooked)',
      description: 'Large egg, scrambled or boiled',
      calories: 155,
      protein: 13,
      fat: 11,
      carbs: 1.1,
      fiber: 0,
      source: 'CUSTOM'
    }
  ]

  for (const foodData of foods) {
    await prisma.food.upsert({
      where: { 
        name: foodData.name 
      },
      update: {},
      create: foodData
    })
  }
  console.log('✅ Seeded basic food items')

  // Create sample meal entries for demo users
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const createdFoods = await prisma.food.findMany()
  
  // Add some sample meals for the first user
  if (users.length > 0 && createdFoods.length > 0) {
    const sampleMeals = [
      {
        userId: users[0].id,
        foodId: createdFoods.find(f => f.name.includes('Egg')).id,
        quantity: 100,
        date: new Date(today.setHours(8, 0, 0, 0)),
        mealType: 'breakfast',
        notes: 'Scrambled with a little butter'
      },
      {
        userId: users[0].id,
        foodId: createdFoods.find(f => f.name.includes('Banana')).id,
        quantity: 120,
        date: new Date(today.setHours(8, 30, 0, 0)),
        mealType: 'breakfast'
      },
      {
        userId: users[0].id,
        foodId: createdFoods.find(f => f.name.includes('Chicken')).id,
        quantity: 150,
        date: new Date(today.setHours(12, 30, 0, 0)),
        mealType: 'lunch'
      },
      {
        userId: users[0].id,
        foodId: createdFoods.find(f => f.name.includes('Brown Rice')).id,
        quantity: 200,
        date: new Date(today.setHours(12, 30, 0, 0)),
        mealType: 'lunch'
      }
    ]

    for (const meal of sampleMeals) {
      await prisma.mealEntry.create({
        data: meal
      })
    }
    console.log('✅ Created sample meal entries')
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
