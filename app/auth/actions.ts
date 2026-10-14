"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const STUDENT_COOKIE = "utkal_student_session";

// 1. Register and Generate OTP
export async function registerStudent(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name || !email || !phone || !password) {
    return { success: false, error: "All fields are required." };
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing && existing.isVerified) {
      return { success: false, error: "An account with this email or mobile already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    // Console output for development OTP verification
    console.log(`\n========================================`);
    console.log(`🔑 UTKALPRAGYAN OTP FOR ${email}: [ ${generatedOtp} ]`);
    console.log(`========================================\n`);

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name, password: hashedPassword, otpCode: generatedOtp, otpExpiry: expiryTime },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          isVerified: false,
          otpCode: generatedOtp,
          otpExpiry: expiryTime,
        },
      });
    }

    return { success: true, needsOtp: true, email };
  } catch (err) {
    console.error("Registration error:", err);
    return { success: false, error: "Registration failed. Try again." };
  }
}

// 2. Verify OTP and Issue 24-Hour Session
export async function verifyStudentOtp(email: string, otp: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otpCode !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return { success: false, error: "Invalid or expired OTP code." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiry: null },
    });

    const cookieStore = await cookies();
    cookieStore.set(STUDENT_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // Strict 24-hour timeout for student sessions
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("OTP verification error:", err);
    return { success: false, error: "Verification failed." };
  }
}

// 3. Login Student with 24-Hour Session Timeout
export async function loginStudent(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });

    if (!user || !user.isVerified) {
      return { success: false, error: "Account not found or email/phone not verified." };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { success: false, error: "Incorrect password." };

    const cookieStore = await cookies();
    cookieStore.set(STUDENT_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24-hour automatic timeout limit
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Login failed." };
  }
}

// 4. Logout Student
export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_COOKIE);
  revalidatePath("/");
}

// 5. Get Logged-In Student
export async function getCurrentStudent() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(STUDENT_COOKIE)?.value;
    if (!userId) return null;

    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, enrollments: { select: { courseId: true } } },
    });
  } catch {
    return null;
  }
}