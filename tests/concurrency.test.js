const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/database/prisma");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Concurrent seat booking protection", () => {
  test("Only one of 10 simultaneous requests can hold the same seat", async () => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app)
          .post("/api/reservations/hold")
          .send({ showId: 1, seatId: 4 })
      )
    );

    const successful = responses.filter(
      (response) => response.statusCode === 201
    );

    const rejected = responses.filter(
      (response) => response.statusCode === 409
    );

    try {
      console.log("Successful holds:", successful.length);
      console.log("Rejected requests:", rejected.length);

      expect(successful).toHaveLength(1);
      expect(rejected).toHaveLength(9);
    } finally {
      // Release the test reservation so the seat is available again.
      if (successful.length > 0) {
        const reservationId = successful[0].body.data.id;

        await request(app).post(
          `/api/reservations/${reservationId}/cancel`
        );
      }
    }
  });
});
