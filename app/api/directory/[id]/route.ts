import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await segmentData.params;

  // Users can only edit their own profile, admins can edit any
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";

  if (!isAdmin && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { jobTitle, phone, linkedin, bio, birthday } = body;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(jobTitle !== undefined && { jobTitle }),
      ...(phone !== undefined && { phone }),
      ...(linkedin !== undefined && { linkedin }),
      ...(bio !== undefined && { bio: bio?.substring(0, 200) }),
      ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      jobTitle: true,
      phone: true,
      linkedin: true,
      bio: true,
      birthday: true,
    },
  });

  return NextResponse.json(updated);
}
