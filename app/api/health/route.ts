import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.count();
    const companies = await prisma.transportCompany.count();
    const trucks = await prisma.truck.count();
    const docks = await prisma.dock.count();
    const trips = await prisma.trip.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: {
        users,
        companies,
        trucks,
        docks,
        trips,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "not connected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}