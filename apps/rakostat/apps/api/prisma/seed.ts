import { PrismaClient, UserRole, Campus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create technologies
  const technologies = await Promise.all([
    prisma.technology.upsert({
      where: { name: 'Projector' },
      update: {},
      create: {
        name: 'Projector',
        description: 'HD Projector for presentations',
      },
    }),
    prisma.technology.upsert({
      where: { name: 'Smart Board' },
      update: {},
      create: {
        name: 'Smart Board',
        description: 'Interactive whiteboard',
      },
    }),
    prisma.technology.upsert({
      where: { name: 'Whiteboard' },
      update: {},
      create: {
        name: 'Whiteboard',
        description: 'Traditional whiteboard',
      },
    }),
    prisma.technology.upsert({
      where: { name: 'Air Conditioning' },
      update: {},
      create: {
        name: 'Air Conditioning',
        description: 'Climate control system',
      },
    }),
    prisma.technology.upsert({
      where: { name: 'Conference Equipment' },
      update: {},
      create: {
        name: 'Conference Equipment',
        description: 'Video conferencing setup',
      },
    }),
    prisma.technology.upsert({
      where: { name: 'Sound System' },
      update: {},
      create: {
        name: 'Sound System',
        description: 'Audio system with microphones',
      },
    }),
  ])

  console.log('✅ Created technologies')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@costaatt.edu.tt' },
    update: {},
    create: {
      email: 'admin@costaatt.edu.tt',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log('✅ Created admin user')

  // Create sample rooms for each campus
  const campuses = [
    { campus: Campus.CITY_CAMPUS, rooms: [
      { name: 'Room 101', capacity: 30 },
      { name: 'Room 102', capacity: 25 },
      { name: 'Room 103', capacity: 40 },
      { name: 'Conference Room A', capacity: 15 },
      { name: 'Lecture Hall 1', capacity: 100 },
    ]},
    { campus: Campus.NORTH_LEARNING_CENTER, rooms: [
      { name: 'Computer Lab 1', capacity: 30 },
      { name: 'Computer Lab 2', capacity: 30 },
      { name: 'Study Room 1', capacity: 8 },
      { name: 'Study Room 2', capacity: 8 },
    ]},
    { campus: Campus.CHAGUANAS_CAMPUS, rooms: [
      { name: 'Room 201', capacity: 35 },
      { name: 'Room 202', capacity: 30 },
      { name: 'Room 203', capacity: 25 },
      { name: 'Library Meeting Room', capacity: 12 },
    ]},
    { campus: Campus.SAN_FERNANDO_CAMPUS, rooms: [
      { name: 'Room 301', capacity: 30 },
      { name: 'Room 302', capacity: 25 },
      { name: 'Room 303', capacity: 40 },
      { name: 'Auditorium', capacity: 150 },
    ]},
    { campus: Campus.TOBAGO_CAMPUS, rooms: [
      { name: 'Room 401', capacity: 20 },
      { name: 'Room 402', capacity: 25 },
      { name: 'Room 403', capacity: 30 },
    ]},
  ]

  for (const { campus, rooms } of campuses) {
    for (const room of rooms) {
      const createdRoom = await prisma.room.upsert({
        where: { 
          name_campus: { 
            name: room.name, 
            campus: campus 
          } 
        },
        update: {},
        create: {
          name: room.name,
          campus: campus,
          capacity: room.capacity,
          isActive: true,
        },
      })

      // Add random technologies to rooms
      const randomTechs = technologies
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 1)

      for (const tech of randomTechs) {
        await prisma.roomTechnology.upsert({
          where: {
            roomId_technologyId: {
              roomId: createdRoom.id,
              technologyId: tech.id,
            },
          },
          update: {},
          create: {
            roomId: createdRoom.id,
            technologyId: tech.id,
          },
        })
      }
    }
  }

  console.log('✅ Created rooms for all campuses')

  // Create sample users
  const sampleUsers = [
    {
      email: 'dean.city@costaatt.edu.tt',
      name: 'Dr. Jane Smith',
      role: UserRole.CAMPUS_DEAN,
      campus: Campus.CITY_CAMPUS,
    },
    {
      email: 'dean.chaguanas@costaatt.edu.tt',
      name: 'Dr. Michael Johnson',
      role: UserRole.CAMPUS_DEAN,
      campus: Campus.CHAGUANAS_CAMPUS,
    },
    {
      email: 'registry@costaatt.edu.tt',
      name: 'Sarah Wilson',
      role: UserRole.REGISTRY,
    },
    {
      email: 'facilities@costaatt.edu.tt',
      name: 'Robert Brown',
      role: UserRole.FACILITIES,
    },
    {
      email: 'staff1@costaatt.edu.tt',
      name: 'Alice Davis',
      role: UserRole.STAFF,
      campus: Campus.CITY_CAMPUS,
    },
    {
      email: 'staff2@costaatt.edu.tt',
      name: 'Bob Wilson',
      role: UserRole.STAFF,
      campus: Campus.SAN_FERNANDO_CAMPUS,
    },
  ]

  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        campus: user.campus,
        isActive: true,
      },
    })
  }

  console.log('✅ Created sample users')

  // Create sample bookings
  const allRooms = await prisma.room.findMany()
  const allUsers = await prisma.user.findMany()

  const sampleBookings = [
    {
      title: 'Faculty Meeting',
      description: 'Monthly faculty meeting',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
      status: 'CONFIRMED' as const,
    },
    {
      title: 'Student Presentation',
      description: 'Final year project presentations',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // Day after tomorrow + 3 hours
      status: 'PENDING' as const,
    },
    {
      title: 'Training Session',
      description: 'Staff training on new systems',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 3 days from now + 4 hours
      status: 'CONFIRMED' as const,
    },
  ]

  for (let i = 0; i < sampleBookings.length; i++) {
    const booking = sampleBookings[i]
    const room = allRooms[Math.floor(Math.random() * allRooms.length)]
    const user = allUsers[Math.floor(Math.random() * allUsers.length)]

    await prisma.booking.create({
      data: {
        title: booking.title,
        description: booking.description,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        roomId: room.id,
        userId: user.id,
      },
    })
  }

  console.log('✅ Created sample bookings')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
