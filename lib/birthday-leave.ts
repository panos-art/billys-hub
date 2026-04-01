import { prisma } from "./prisma";

const BIRTHDAY_LEAVE_ID = "birthday-leave";

export async function ensureBirthdayLeaveBalance(userId: string, year: number) {
  const leaveType = await prisma.leaveType.findUnique({
    where: { id: BIRTHDAY_LEAVE_ID },
  });

  if (!leaveType || !leaveType.isActive) return;

  await prisma.leaveBalance.upsert({
    where: {
      userId_leaveTypeId_year: {
        userId,
        leaveTypeId: BIRTHDAY_LEAVE_ID,
        year,
      },
    },
    update: {},
    create: {
      userId,
      leaveTypeId: BIRTHDAY_LEAVE_ID,
      year,
      totalDays: leaveType.defaultDays,
      usedDays: 0,
    },
  });
}
