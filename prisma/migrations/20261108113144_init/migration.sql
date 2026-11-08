-- CreateEnum
CREATE TYPE "SeatCategory" AS ENUM ('GENERAL', 'PREMIUM', 'RECLINER');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "screenName" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "showId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "category" "SeatCategory" NOT NULL DEFAULT 'GENERAL',
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "seatId" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'HOLD',
    "expiresAt" TIMESTAMP(3),
    "activeSeatKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Show_startsAt_idx" ON "Show"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_showId_seatNumber_key" ON "Seat"("showId", "seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bookingCode_key" ON "Reservation"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_activeSeatKey_key" ON "Reservation"("activeSeatKey");

-- CreateIndex
CREATE INDEX "Reservation_status_expiresAt_idx" ON "Reservation"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
