// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Fee Type for Transport
  await prisma.feeType.upsert({
    where: { name: 'Transport Fee' },
    update: {},
    create: {
      name: 'Transport Fee',
      description: 'Monthly transport fee',
      category: 'Transport',
    },
  });

  // Create Sample Students
  await Promise.all([
    prisma.student.create({
      data: {
        admissionNumber: 'STD001',
        firstName: 'Rahim',
        lastName: 'Ahmed',
        email: 'rahim@example.com',
        phone: '01712345678',
        class: 'Class 10',
        section: 'A',
        rollNumber: '01',
        parentName: 'Mr. Ahmed',
        parentPhone: '01712345679',
        address: 'Dhaka, Bangladesh',
      },
    }),
    prisma.student.create({
      data: {
        admissionNumber: 'STD002',
        firstName: 'Fatima',
        lastName: 'Khan',
        email: 'fatima@example.com',
        phone: '01812345678',
        class: 'Class 9',
        section: 'B',
        rollNumber: '05',
        parentName: 'Mr. Khan',
        parentPhone: '01812345679',
        address: 'Dhaka, Bangladesh',
      },
    }),
  ]);

  // Create Sample Pickup Points
  const pickupPoints = await Promise.all([
    prisma.pickupPoint.create({
      data: {
        name: 'Mohammadpur Bus Stop',
        address: 'Mohammadpur, Dhaka',
        landmark: 'Near Mohammadpur Market',
      },
    }),
    prisma.pickupPoint.create({
      data: {
        name: 'Dhanmondi 27',
        address: 'Road 27, Dhanmondi, Dhaka',
        landmark: 'Near Rabindra Sarobar',
      },
    }),
    prisma.pickupPoint.create({
      data: {
        name: 'Mirpur 10',
        address: 'Mirpur 10, Dhaka',
        landmark: 'Near Mirpur 10 Circle',
      },
    }),
  ]);

  // Create Sample Vehicles
  await Promise.all([
    prisma.vehicle.create({
      data: {
        vehicleNumber: 'DHK-GA-11-1234',
        vehicleType: 'Bus',
        capacity: 40,
        driverName: 'Karim Mia',
        driverPhone: '01912345678',
        driverLicense: 'DL123456',
        helperName: 'Rahim Mia',
        helperPhone: '01912345679',
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleNumber: 'DHK-GA-11-5678',
        vehicleType: 'Van',
        capacity: 15,
        driverName: 'Jamal Uddin',
        driverPhone: '01812345670',
        driverLicense: 'DL789012',
        helperName: 'Salam Mia',
        helperPhone: '01812345671',
      },
    }),
  ]);

  // Create Sample Routes
  const routes = await Promise.all([
    prisma.route.create({
      data: {
        routeName: 'Route A - Mohammadpur to School',
        routeCode: 'RTA',
        startPoint: 'Mohammadpur',
        endPoint: 'ABC School',
        distance: 8.5,
        estimatedDuration: 45,
      },
    }),
    prisma.route.create({
      data: {
        routeName: 'Route B - Dhanmondi to School',
        routeCode: 'RTB',
        startPoint: 'Dhanmondi',
        endPoint: 'ABC School',
        distance: 6.2,
        estimatedDuration: 35,
      },
    }),
  ]);

  // Link Pickup Points to Routes
  await prisma.routePickupPoint.createMany({
    data: [
      {
        routeId: routes[0].id,
        pickupPointId: pickupPoints[0].id,
        sequenceOrder: 1,
        estimatedTime: '07:00 AM',
      },
      {
        routeId: routes[0].id,
        pickupPointId: pickupPoints[2].id,
        sequenceOrder: 2,
        estimatedTime: '07:20 AM',
      },
      {
        routeId: routes[1].id,
        pickupPointId: pickupPoints[1].id,
        sequenceOrder: 1,
        estimatedTime: '07:10 AM',
      },
    ],
  });

  // Create Transport Fee Structures
  const currentYear = process.env.CURRENT_ACADEMIC_YEAR || '2024-2025';
  
  await prisma.transportFeeMaster.createMany({
    data: [
      {
        routeId: routes[0].id,
        monthlyFee: 1500,
        description: 'Monthly fee for Route A',
        academicYear: currentYear,
      },
      {
        routeId: routes[1].id,
        monthlyFee: 1200,
        description: 'Monthly fee for Route B',
        academicYear: currentYear,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });