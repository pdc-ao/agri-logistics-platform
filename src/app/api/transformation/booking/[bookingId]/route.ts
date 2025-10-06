// src/app/api/transformation/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

// GET - Get specific booking details
export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: { bookingId: string } },
    user
  ) => {
    try {
      const { bookingId } = params;

      const booking = await prisma.facilityBooking.findUnique({
        where: { id: bookingId },
        include: {
          facility: {
            include: {
              owner: {
                select: {
                  id: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Check authorization
      const isAuthorized =
        booking.userId === user.id ||
        booking.facility.ownerId === user.id ||
        user.role === "ADMIN";

      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Not authorized to view this booking" },
          { status: 403 }
        );
      }

      return NextResponse.json({ booking });
    } catch (error) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { error: "Failed to fetch booking" },
        { status: 500 }
      );
    }
  }
);

// PATCH - Update booking status or details
export const PATCH = withAuth(
  async (
    request: NextRequest,
    { params }: { params: { bookingId: string } },
    user
  ) => {
    try {
      const { bookingId } = params;
      const { status, notes, actualStartDate, actualEndDate } =
        await request.json();

      const booking = await prisma.facilityBooking.findUnique({
        where: { id: bookingId },
        include: {
          facility: {
            include: { owner: true },
          },
          user: true,
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Authorization check
      const isFacilityOwner = booking.facility.ownerId === user.id;
      const isCustomer = booking.userId === user.id;
      const isAdmin = user.role === "ADMIN";

      if (!isFacilityOwner && !isCustomer && !isAdmin) {
        return NextResponse.json(
          { error: "Not authorized to update this booking" },
          { status: 403 }
        );
      }

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: [],
      };

      if (status) {
        const allowedTransitions =
          validTransitions[booking.status] || [];

        if (!allowedTransitions.includes(status)) {
          return NextResponse.json(
            {
              error: `Cannot transition from ${booking.status} to ${status}`,
              allowedTransitions,
            },
            { status: 400 }
          );
        }

        // Only facility owner can confirm bookings
        if (status === "CONFIRMED" && !isFacilityOwner && !isAdmin) {
          return NextResponse.json(
            { error: "Only facility owner can confirm bookings" },
            { status: 403 }
          );
        }

        // Only customer can cancel PENDING bookings
        if (
          status === "CANCELLED" &&
          booking.status === "PENDING" &&
          !isCustomer &&
          !isAdmin
        ) {
          return NextResponse.json(
            { error: "Only customer can cancel pending bookings" },
            { status: 403 }
          );
        }
      }

      // Update booking
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (status) updateData.status = status;
      if (notes) updateData.notes = notes;
      if (actualStartDate) updateData.actualStartDate = new Date(actualStartDate);
      if (actualEndDate) updateData.actualEndDate = new Date(actualEndDate);

      const updatedBooking = await prisma.facilityBooking.update({
        where: { id: bookingId },
        data: updateData,
        include: {
          facility: true,
          user: true,
        },
      });

      // Send notifications based on status change
      if (status) {
        let notificationType = "";
        let recipientIds: string[] = [];

        switch (status) {
          case "CONFIRMED":
            notificationType = "FACILITY_BOOKING_CONFIRMED";
            recipientIds = [booking.userId];
            break;
          case "CANCELLED":
            notificationType = "BOOKING_CANCELLED";
            recipientIds = [booking.userId, booking.facility.ownerId].filter(
              (id) => id !== user.id
            );
            break;
          case "IN_PROGRESS":
            notificationType = "BOOKING_STARTED";
            recipientIds = [booking.userId];
            break;
          case "COMPLETED":
            notificationType = "BOOKING_COMPLETED";
            recipientIds = [booking.userId, booking.facility.ownerId];
            break;
        }

        if (notificationType && recipientIds.length > 0) {
          await sendNotification({
            type: notificationType,
            recipientIds,
            data: {
              bookingId: booking.id,
              facilityName: booking.facility.name,
              serviceType: booking.serviceType,
              startDate: booking.startDate.toISOString(),
              endDate: booking.endDate.toISOString(),
              totalCost: booking.totalCost,
              currency: booking.currency,
              notes,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        message: `Booking ${status ? "status updated" : "updated"} successfully`,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }
  }
);

// DELETE - Cancel booking
export const DELETE = withAuth(
  async (
    request: NextRequest,
    { params }: { params: { bookingId: string } },
    user
  ) => {
    try {
      const { bookingId } = params;

      const booking = await prisma.facilityBooking.findUnique({
        where: { id: bookingId },
        include: {
          facility: {
            include: { owner: true },
          },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Only customer or admin can delete their own bookings
      if (booking.userId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Not authorized to delete this booking" },
          { status: 403 }
        );
      }

      // Can only delete PENDING bookings
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          {
            error: "Can only cancel pending bookings. Use status update for others.",
          },
          { status: 400 }
        );
      }

      await prisma.facilityBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      // Notify facility owner
      await sendNotification({
        type: "BOOKING_CANCELLED",
        recipientIds: [booking.facility.ownerId],
        data: {
          bookingId: booking.id,
          facilityName: booking.facility.name,
          serviceType: booking.serviceType,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return NextResponse.json(
        { error: "Failed to cancel booking" },
        { status: 500 }
      );
    }
  }
);