import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getAllHolidays } from "../lib/holidays";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // --- Departments ---
  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering" },
  });

  const sales = await prisma.department.upsert({
    where: { name: "Sales" },
    update: {},
    create: { name: "Sales" },
  });

  const operations = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {},
    create: { name: "Operations" },
  });

  const marketing = await prisma.department.upsert({
    where: { name: "Marketing" },
    update: {},
    create: { name: "Marketing" },
  });

  console.log("✓ Departments created");

  // --- Users ---
  const ceo = await prisma.user.upsert({
    where: { email: "ceo@billys.gr" },
    update: {},
    create: {
      email: "ceo@billys.gr",
      name: "CEO Billys",
      role: "SUPER_ADMIN",
      jobTitle: "CEO",
      departmentId: operations.id,
      isActive: true,
    },
  });

  const hr = await prisma.user.upsert({
    where: { email: "hr@billys.gr" },
    update: {},
    create: {
      email: "hr@billys.gr",
      name: "HR Manager",
      role: "HR_ADMIN",
      jobTitle: "HR Manager",
      departmentId: operations.id,
      isActive: true,
    },
  });

  console.log("✓ Users created");

  // --- Leave Types ---
  const leaveTypes = [
    { name: "Κανονική Άδεια", nameEn: "Annual Leave", defaultDays: 20 },
    { name: "Αναρρωτική Άδεια", nameEn: "Sick Leave", defaultDays: 8 },
    { name: "Άδεια Γάμου", nameEn: "Marriage Leave", defaultDays: 5 },
    { name: "Πένθιμη Άδεια", nameEn: "Bereavement Leave", defaultDays: 3 },
    { name: "Εκπαιδευτική Άδεια", nameEn: "Study Leave", defaultDays: 5 },
    { name: "Άδεια Γενεθλίων", nameEn: "Birthday Leave", defaultDays: 1 },
  ];

  const createdLeaveTypes = [];
  for (const lt of leaveTypes) {
    const created = await prisma.leaveType.upsert({
      where: { id: lt.nameEn.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: lt.nameEn.toLowerCase().replace(/\s+/g, "-"),
        ...lt,
        requiresApproval: lt.nameEn !== "Birthday Leave",
        isActive: true,
      },
    });
    createdLeaveTypes.push(created);
  }

  console.log("✓ Leave types created");

  // --- Leave Balances for seeded users ---
  const currentYear = new Date().getFullYear();
  for (const user of [ceo, hr]) {
    for (const lt of createdLeaveTypes) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: user.id,
            leaveTypeId: lt.id,
            year: currentYear,
          },
        },
        update: {},
        create: {
          userId: user.id,
          leaveTypeId: lt.id,
          year: currentYear,
          totalDays: lt.defaultDays,
          usedDays: 0,
        },
      });
    }
  }

  console.log("✓ Leave balances created");

  // --- Public Holidays ---
  for (let year = 2024; year <= 2030; year++) {
    const holidays = getAllHolidays(year);
    for (const holiday of holidays) {
      const dateOnly = new Date(
        Date.UTC(
          holiday.date.getFullYear(),
          holiday.date.getMonth(),
          holiday.date.getDate()
        )
      );
      await prisma.publicHoliday.upsert({
        where: { date: dateOnly },
        update: {},
        create: {
          name: holiday.name,
          date: dateOnly,
          isRecurring: holiday.isRecurring,
          year,
        },
      });
    }
  }

  console.log("✓ Public holidays created for 2024-2030");

  // --- Knowledge Categories ---
  const categories = [
    { name: "Onboarding", slug: "onboarding", order: 1 },
    { name: "Πολιτικές HR", slug: "politikes-hr", order: 2 },
    { name: "Engineering", slug: "engineering", order: 3 },
  ];

  for (const cat of categories) {
    const category = await prisma.knowledgeCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    const articleSlug = `${cat.slug}-intro`;
    await prisma.knowledgeArticle.upsert({
      where: { slug: articleSlug },
      update: {},
      create: {
        title: `Εισαγωγή: ${cat.name}`,
        slug: articleSlug,
        content: `<h2>Καλώς ήρθατε στο ${cat.name}</h2><p>Αυτό είναι ένα δείγμα άρθρου για την κατηγορία ${cat.name}. Επεξεργαστείτε αυτό το άρθρο για να προσθέσετε σχετικό περιεχόμενο.</p>`,
        published: true,
        featured: false,
        categoryId: category.id,
        authorId: hr.id,
      },
    });
  }

  console.log("✓ Knowledge categories and articles created");

  // --- Announcement ---
  await prisma.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      title: "Καλώς ήρθατε στο Billys Hub!",
      body: "<p>Το <strong>Billys Hub</strong> είναι η νέα εσωτερική πλατφόρμα της ομάδας μας. Εδώ μπορείτε να υποβάλλετε αιτήματα αδειών, να διαβάζετε ανακοινώσεις και πολλά ακόμα.</p>",
      isPinned: true,
      authorId: ceo.id,
    },
  });

  console.log("✓ Announcement created");
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
