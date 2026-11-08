const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/database/prisma");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Cinema Ticketing API", () => {
  test("GET /health should return UP status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("UP");
  });

  test("GET /api/shows should return all shows", async () => {
    const response = await request(app).get("/api/shows");

    expect(response.statusCode).toBe(200);
  });

  test("GET /api/shows/1/seats should return show seats", async () => {
    const response = await request(app).get("/api/shows/1/seats");

    expect(response.statusCode).toBe(200);
  });

  test("GET /api/shows/999999/seats should return 404", async () => {
    const response = await request(app).get("/api/shows/999999/seats");

    expect(response.statusCode).toBe(404);
  });

  test("Reservation should complete hold, confirm and cancel lifecycle", async () => {
    const holdResponse = await request(app)
      .post("/api/reservations/hold")
      .send({ showId: 1, seatId: 3 });

    expect(holdResponse.statusCode).toBe(201);
    expect(holdResponse.body.success).toBe(true);

    const reservationId = holdResponse.body.data.id;

    const confirmResponse = await request(app)
      .post(`/api/reservations/${reservationId}/confirm`);

    expect(confirmResponse.statusCode).toBe(200);
    expect(confirmResponse.body.data.status).toBe("CONFIRMED");

    const cancelResponse = await request(app)
      .post(`/api/reservations/${reservationId}/cancel`);

    expect(cancelResponse.statusCode).toBe(200);
    expect(cancelResponse.body.data.status).toBe("CANCELLED");
  });
});
